import { strToU8, zipSync } from "fflate";
import type { MeshData } from "../geometry";

type PrintPart = {
  name: string;
  mesh: MeshData;
  /** 1-based filament slot the slicer should print this part with. */
  extruder: number;
};

/** One tag on the bed; `x` and `y` are its centre, millimetres from the corner. */
export type PrintItem = {
  name: string;
  parts: PrintPart[];
  x: number;
  y: number;
};

export type PrintMaterials = { name: string; color: string }[];

const CORE = "http://schemas.microsoft.com/3dmanufacturing/core/2015/02";
/** 3MF coordinates are micrometres at most. */
const micrometres = (value: number) => String(Math.round(value * 1000) / 1000);

function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char] ?? char,
  );
}

/** One mesh object with a deduplicated vertex table, in core 3MF markup. */
function meshXml(mesh: MeshData, id: number, material: number): string {
  const vertices = new Map<string, number>();
  const rows: string[] = [];
  const index: number[] = [];
  for (let corner = 0; corner < mesh.triangles * 3; corner++) {
    const x = micrometres(mesh.positions[corner * 3] ?? 0);
    const y = micrometres(mesh.positions[corner * 3 + 1] ?? 0);
    const z = micrometres(mesh.positions[corner * 3 + 2] ?? 0);
    const key = `${x},${y},${z}`;
    let vertex = vertices.get(key);
    if (vertex === undefined) {
      vertex = rows.length;
      vertices.set(key, vertex);
      rows.push(`<vertex x="${x}" y="${y}" z="${z}"/>`);
    }
    index.push(vertex);
  }
  const triangles: string[] = [];
  for (let t = 0; t < index.length; t += 3)
    triangles.push(
      `<triangle v1="${index[t]}" v2="${index[t + 1]}" v3="${index[t + 2]}"/>`,
    );
  return `<object id="${id}" type="model" pid="1" pindex="${material}"><mesh><vertices>${rows.join("")}</vertices><triangles>${triangles.join("")}</triangles></mesh></object>`;
}

/**
 * A 3MF the QIDI Studio / OrcaSlicer family opens as a ready plate: object
 * names, per-part extruders and bed positions survive the import, while the
 * user's printer and filament profiles are left untouched (the file carries
 * no project settings and no slicer tags). Other slicers still read the
 * meshes and base material colours from the core 3MF part.
 */
export function encode3mf(
  items: PrintItem[],
  materials: PrintMaterials,
  title: string,
): Uint8Array {
  // Identical meshes (copies of a tag) are stored once and referenced.
  const meshes = new Map<MeshData, { id: number; material: number }>();
  const objects: string[] = [];
  let nextId = 2; // 1 is the base materials table
  const meshId = (mesh: MeshData, material: number) => {
    let entry = meshes.get(mesh);
    if (!entry) {
      entry = { id: nextId++, material };
      meshes.set(mesh, entry);
    }
    return entry.id;
  };

  const build: string[] = [];
  const settings: string[] = [];
  for (const item of items) {
    const parts = item.parts.map((part) => ({
      part,
      id: meshId(part.mesh, part.extruder - 1),
    }));
    let objectId = parts[0]?.id ?? 0;
    if (parts.length > 1) {
      objectId = nextId++;
      objects.push(
        `<object id="${objectId}" type="model"><components>${parts
          .map((entry) => `<component objectid="${entry.id}"/>`)
          .join("")}</components></object>`,
      );
    }
    build.push(
      `<item objectid="${objectId}" transform="1 0 0 0 1 0 0 0 1 ${micrometres(item.x)} ${micrometres(item.y)} 0"/>`,
    );
    settings.push(
      `<object id="${objectId}"><metadata key="name" value="${escapeXml(item.name)}"/>${parts
        .map(
          (entry) =>
            `<part id="${entry.id}" subtype="model_part"><metadata key="name" value="${escapeXml(entry.part.name)}"/><metadata key="extruder" value="${entry.part.extruder}"/></part>`,
        )
        .join("")}</object>`,
    );
  }

  const meshObjects = [...meshes]
    .map(([mesh, entry]) => meshXml(mesh, entry.id, entry.material))
    .join("");
  const model = `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xml:lang="ru-RU" xmlns="${CORE}"><metadata name="Title">${escapeXml(title)}</metadata><metadata name="Application">3dbirka editor</metadata><resources><basematerials id="1">${materials
    .map(
      (material) =>
        `<base name="${escapeXml(material.name)}" displaycolor="${material.color.toUpperCase()}FF"/>`,
    )
    .join(
      "",
    )}</basematerials>${meshObjects}${objects.join("")}</resources><build>${build.join("")}</build></model>`;

  return zipSync(
    {
      "[Content_Types].xml": strToU8(
        '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/><Default Extension="config" ContentType="text/xml"/></Types>',
      ),
      "_rels/.rels": strToU8(
        `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/><Relationship Target="/Metadata/model_settings.config" Id="rel-2" Type="http://schemas.slic3r.org/3mf/2017/06/model_settings.config"/></Relationships>`,
      ),
      "3D/3dmodel.model": strToU8(model),
      "Metadata/model_settings.config": strToU8(
        `<?xml version="1.0" encoding="UTF-8"?><config>${settings.join("")}</config>`,
      ),
    },
    { level: 6 },
  );
}
