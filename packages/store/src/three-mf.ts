import { zipSync } from "fflate";

type Vertex = [number, number, number];
type Triangle = [Vertex, Vertex, Vertex];
const encoder = new TextEncoder();

function readTriangles(bytes: Uint8Array): Triangle[] {
  if (bytes.length >= 84) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const count = view.getUint32(80, true);
    if (84 + count * 50 === bytes.length) {
      const triangles: Triangle[] = [];
      for (let i = 0; i < count; i++) {
        const offset = 84 + i * 50 + 12;
        triangles.push(
          [0, 1, 2].map(
            (vertex) =>
              [0, 1, 2].map((axis) =>
                view.getFloat32(offset + vertex * 12 + axis * 4, true),
              ) as Vertex,
          ) as Triangle,
        );
      }
      return triangles;
    }
  }
  const text = new TextDecoder().decode(bytes);
  const coordinates = [
    ...text.matchAll(/\bvertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g),
  ].map(
    (match) => [Number(match[1]), Number(match[2]), Number(match[3])] as Vertex,
  );
  if (!coordinates.length || coordinates.length % 3 !== 0)
    throw new Error("OpenSCAD вернул некорректный STL");
  const triangles: Triangle[] = [];
  for (let i = 0; i < coordinates.length; i += 3) {
    const a = coordinates[i];
    const b = coordinates[i + 1];
    const c = coordinates[i + 2];
    if (!a || !b || !c) throw new Error("OpenSCAD вернул некорректный STL");
    triangles.push([a, b, c]);
  }
  return triangles;
}

const namedColors: Record<string, string> = {
  белый: "#FFFFFF",
  white: "#FFFFFF",
  чёрный: "#202020",
  черный: "#202020",
  black: "#202020",
  зелёный: "#28513E",
  зеленый: "#28513E",
  green: "#28513E",
  красный: "#AE6849",
  red: "#AE6849",
  жёлтый: "#E6C963",
  желтый: "#E6C963",
  yellow: "#E6C963",
  синий: "#345A80",
  blue: "#345A80",
  золотой: "#E9C981",
  gold: "#E9C981",
  молочный: "#F4EFE4",
  графит: "#343935",
  терракота: "#AE6849",
  песочный: "#DDC6A4",
  хвойный: "#28513E",
  грифель: "#1F2221",
  мел: "#F2EAD9",
  дуб: "#B99066",
  шалфей: "#8D987E",
  лаванда: "#9D899C",
  сливочный: "#EFE5D4",
  морковный: "#EB7C28",
  клубничный: "#D84A3D",
  шоколадный: "#6E4B36",
  оливковый: "#7AA854",
};

function color(value: string, fallback: string) {
  const trimmed = value.trim();
  if (/^#[\da-f]{6}$/i.test(trimmed)) return trimmed.toUpperCase();
  return namedColors[trimmed.toLowerCase()] ?? fallback;
}

function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] ?? character,
  );
}

/** Turn the exact OpenSCAD STL into a millimetre 3MF with filament colors. */
export function stlTo3mf(
  stl: Uint8Array,
  options: {
    name: string;
    baseColor: string;
    textColor: string;
    accentColor?: string;
  },
): Uint8Array {
  const triangles = readTriangles(stl);
  if (!triangles.length) throw new Error("STL не содержит треугольников");
  const hasAccent = Boolean(options.accentColor);
  const vertices: string[] = [];
  const faces: string[] = [];
  const vertexIds = new Map<string, number>();
  for (const triangle of triangles) {
    const indices = triangle.map((point) => {
      if (point.some((coordinate) => !Number.isFinite(coordinate)))
        throw new Error("STL содержит недопустимые координаты");
      const key = point.join(",");
      let id = vertexIds.get(key);
      if (id === undefined) {
        id = vertices.length;
        vertexIds.set(key, id);
        vertices.push(
          `<vertex x="${point[0]}" y="${point[1]}" z="${point[2]}"/>`,
        );
      }
      return id;
    });
    const maxZ = Math.max(triangle[0][2], triangle[1][2], triangle[2][2]);
    const material = hasAccent
      ? maxZ > 2.6001
        ? 1
        : maxZ > 2.2001
          ? 2
          : 0
      : maxZ > 2.0001
        ? 1
        : 0;
    faces.push(
      `<triangle v1="${indices[0]}" v2="${indices[1]}" v3="${indices[2]}" pid="1" p1="${material}" p2="${material}" p3="${material}"/>`,
    );
  }
  const base = color(options.baseColor, "#F4EFE4");
  const text = color(options.textColor, "#26302A");
  const accent = options.accentColor
    ? `<base name="Декор" displaycolor="${color(options.accentColor, "#7AA854")}FF"/>`
    : "";
  const model = `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="ru-RU" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">${escapeXml(options.name)}</metadata><resources><basematerials id="1"><base name="Корпус" displaycolor="${base}FF"/><base name="Надпись" displaycolor="${text}FF"/>${accent}</basematerials><object id="2" type="model"><mesh><vertices>${vertices.join("")}</vertices><triangles>${faces.join("")}</triangles></mesh></object></resources><build><item objectid="2"/></build></model>`;
  return zipSync(
    {
      "[Content_Types].xml": encoder.encode(
        '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>',
      ),
      "_rels/.rels": encoder.encode(
        '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>',
      ),
      "3D/3dmodel.model": encoder.encode(model),
    },
    { level: 6 },
  );
}
