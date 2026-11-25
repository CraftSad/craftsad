import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import {
  BufferGeometry,
  ExtrudeGeometry,
  Path,
  Shape,
  Vector3,
} from "three";
import type { ShapeId } from "./data";
import { colorPairs } from "./data";
import { wrapName } from "./tag-config";

type Triangle = [Vector3, Vector3, Vector3];
type PrintPart = { triangles: Triangle[]; color: string };
type PrintModel = { parts: PrintPart[]; width: number; height: number };

const encoder = new TextEncoder();
const thickness = 2.4;

function trianglesFromGeometry(geometry: BufferGeometry): Triangle[] {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const count = index ? index.count : position.count;
  const result: Triangle[] = [];
  for (let i = 0; i + 2 < count; i += 3) {
    const a = index ? index.getX(i) : i;
    const b = index ? index.getX(i + 1) : i + 1;
    const c = index ? index.getX(i + 2) : i + 2;
    result.push([
      new Vector3().fromBufferAttribute(position, a),
      new Vector3().fromBufferAttribute(position, b),
      new Vector3().fromBufferAttribute(position, c),
    ]);
  }
  return result;
}

function tagOutline(shape: ShapeId): { outline: Shape; width: number; height: number } {
  // The whole silhouette is extruded once, so the head and stake form one solid.
  const outline = new Shape();
  const width = shape === "flag" ? 80 : shape === "hanging" ? 80 : 65;
  const half = width / 2;
  const top = shape === "hanging" ? 40 : 27;
  const shoulder = shape === "hanging" ? 0 : shape === "flag" ? -145 : -65;
  const bottom = shape === "hanging" ? 0 : shape === "flag" ? -153 : -73;
  const stemX = shape === "flag" ? -half + 9 : 0;
  outline.moveTo(-half + 3, 0);
  outline.lineTo(stemX - 4, 0);
  if (shape !== "hanging") {
    outline.lineTo(stemX - 4, shoulder);
    outline.lineTo(stemX, bottom);
    outline.lineTo(stemX + 4, shoulder);
    outline.lineTo(stemX + 4, 0);
  }
  outline.lineTo(half - 3, 0);
  outline.quadraticCurveTo(half, 0, half, 3);
  outline.lineTo(half, top - 3);
  outline.quadraticCurveTo(half, top, half - 3, top);
  outline.lineTo(-half + 3, top);
  outline.quadraticCurveTo(-half, top, -half, top - 3);
  outline.lineTo(-half, 3);
  outline.quadraticCurveTo(-half, 0, -half + 3, 0);
  if (shape === "hanging") {
    const hole = new Path();
    hole.absarc(0, 34, 2.2, 0, Math.PI * 2, true);
    outline.holes.push(hole);
  }
  return { outline, width, height: top - bottom };
}

async function makeModel(shape: ShapeId, color: number, name: string): Promise<PrintModel> {
  const pair = colorPairs[color] ?? colorPairs[0];
  const { outline, width, height } = tagOutline(shape);
  const body = new ExtrudeGeometry(outline, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 12,
    steps: 1,
  });
  const parts: PrintPart[] = [{ triangles: trianglesFromGeometry(body), color: pair.base }];
  body.dispose();

  const response = await fetch("/fonts/manrope.typeface.json");
  if (!response.ok) throw new Error("Не удалось загрузить шрифт для печати.");
  const font = new FontLoader().parse(await response.json());
  const lines = wrapName(name);
  const maxTextWidth = width - 10;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!line) continue;
    const text = new TextGeometry(line, {
      font,
      size: 7.2,
      depth: 0.8,
      curveSegments: 6,
      bevelEnabled: false,
    });
    text.computeBoundingBox();
    const bounds = text.boundingBox;
    if (bounds) {
      const textWidth = bounds.max.x - bounds.min.x;
      const scale = Math.min(1, maxTextWidth / Math.max(textWidth, 1));
      text.scale(scale, scale, 1);
      text.computeBoundingBox();
      const fitted = text.boundingBox;
      if (fitted) {
        const y = lines.length === 1 ? 12 : i === 0 ? 17 : 7;
        text.translate(-(fitted.min.x + fitted.max.x) / 2, y - fitted.min.y, thickness - 0.15);
      }
    }
    parts.push({ triangles: trianglesFromGeometry(text), color: pair.ink });
    text.dispose();
  }
  return { parts, width, height };
}

function stl(model: PrintModel): Blob {
  const all = model.parts.flatMap((part) => part.triangles);
  const buffer = new ArrayBuffer(84 + all.length * 50);
  const view = new DataView(buffer);
  view.setUint32(80, all.length, true);
  all.forEach(([a, b, c], i) => {
    const offset = 84 + i * 50;
    const normal = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(c, a)).normalize();
    const values = [normal, a, b, c];
    values.forEach((point, j) => {
      view.setFloat32(offset + j * 12, point.x, true);
      view.setFloat32(offset + j * 12 + 4, point.y, true);
      view.setFloat32(offset + j * 12 + 8, point.z, true);
    });
  });
  return new Blob([buffer], { type: "model/stl" });
}

function xmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[char] ?? char);
}

function modelXml(model: PrintModel, name: string): string {
  const colors = model.parts.map((part) => part.color.toUpperCase());
  const objects = model.parts.map((part, partIndex) => {
    // Separate printable shells retain their assigned filament colors in 3MF.
    const vertices = part.triangles.flat();
    const vertexXml = vertices.map((v) => `<vertex x="${v.x}" y="${v.y}" z="${v.z}"/>`).join("");
    const triangles = part.triangles.map((_, i) => `<triangle v1="${i * 3}" v2="${i * 3 + 1}" v3="${i * 3 + 2}"/>`).join("");
    return `<object id="${partIndex + 2}" type="model" pid="1" pindex="${partIndex}"><mesh><vertices>${vertexXml}</vertices><triangles>${triangles}</triangles></mesh></object>`;
  }).join("");
  const materials = colors.map((hex, i) => `<base name="${i === 0 ? "Корпус" : "Надпись"}" displaycolor="${hex}FF"/>`).join("");
  const build = model.parts.map((_, i) => `<item objectid="${i + 2}"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="ru-RU" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">${xmlEscape(name)}</metadata><resources><basematerials id="1">${materials}</basematerials>${objects}</resources><build>${build}</build></model>`;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zip(entries: { name: string; data: Uint8Array }[]): Blob {
  const chunks: Uint8Array[] = [];
  const directory: Uint8Array[] = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const filename = encoder.encode(name);
    const crc = crc32(data);
    const local = new Uint8Array(30 + filename.length);
    const l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true);
    l.setUint16(4, 20, true);
    l.setUint32(14, crc, true);
    l.setUint32(18, data.length, true);
    l.setUint32(22, data.length, true);
    l.setUint16(26, filename.length, true);
    local.set(filename, 30);
    chunks.push(local, data);
    const central = new Uint8Array(46 + filename.length);
    const c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, filename.length, true);
    c.setUint32(42, offset, true);
    central.set(filename, 46);
    directory.push(central);
    offset += local.length + data.length;
  }
  const directorySize = directory.reduce((size, part) => size + part.length, 0);
  const end = new Uint8Array(22);
  const e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, entries.length, true);
  e.setUint16(10, entries.length, true);
  e.setUint32(12, directorySize, true);
  e.setUint32(16, offset, true);
  return new Blob([...chunks, ...directory, end], { type: "model/3mf" });
}

function threeMf(model: PrintModel, name: string): Blob {
  return zip([
    { name: "[Content_Types].xml", data: encoder.encode('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>') },
    { name: "_rels/.rels", data: encoder.encode('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>') },
    { name: "3D/3dmodel.model", data: encoder.encode(modelXml(model, name)) },
  ]);
}

export async function downloadPrintFile(shape: ShapeId, color: number, name: string, format: "stl" | "3mf") {
  const model = await makeModel(shape, color, name);
  const blob = format === "stl" ? stl(model) : threeMf(model, name);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name.replace(/[^\p{L}\p{N}-]+/gu, "-").slice(0, 48) || "birka"}.${format}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return { width: model.width, height: model.height };
}
