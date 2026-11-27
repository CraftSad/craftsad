import type { CrossSection, Manifold } from "manifold-3d";
import type { Font } from "opentype.js";
import { loadFont } from "./fonts";
import { loadManifold, type ManifoldModule } from "./manifold";
import { resolveText, type Shape, type TagDesign } from "./schema";
import { emptyText, layoutText, type TextLayout, type Vec2 } from "./text";
import { textZones } from "./zones";

/** Triangles of a watertight solid, three positions per triangle (mm). */
export type MeshData = { positions: Float32Array; triangles: number };

export type BuiltTag = {
  body: MeshData;
  /** Raised lettering as its own solid for a second colour; null if none. */
  relief: MeshData | null;
  /** Body and lettering as one solid, for single-colour export; on request. */
  single?: MeshData;
  /** Overall size including the mount. */
  size: { x: number; y: number; z: number };
  /** Centre of that bounding box in model coordinates (the stake pulls it down). */
  center: { x: number; y: number };
  volume: number;
  /** Layout result per text layer. */
  text: TextLayout[];
};

/** Longest chord of an approximated arc, millimetres. */
const ARC_STEP = 0.2;
/** Width left at the pointed end of a stake so it prints as a flat tip. */
const STAKE_TIP = 1.6;
/** Overlap that fuses the stake into the plate. */
const STAKE_ROOT = 1;

const arcSegments = (radius: number, degrees = 360) =>
  Math.min(
    180,
    Math.max(8, Math.ceil((degrees * Math.PI * radius) / 180 / ARC_STEP)),
  );

/** Winding is irrelevant under NonZero, so outlines may run either way. */
function polygon(module: ManifoldModule, points: Vec2[]): CrossSection {
  return module.CrossSection.ofPolygons([points], "NonZero");
}

function plateOutline(module: ManifoldModule, shape: Shape): CrossSection {
  const { width, height } = shape;
  if (shape.kind === "ellipse")
    return module.CrossSection.circle(
      1,
      arcSegments(Math.max(width, height) / 2),
    ).scale([width / 2, height / 2]);
  if (shape.kind === "tongue") {
    // The semicircle may not be taller than the plate, which caps the width.
    const radius = Math.min(width / 2, height);
    const centre = height / 2 - radius;
    const steps = arcSegments(radius, 180);
    const points: Vec2[] = [
      [radius, -height / 2],
      [-radius, -height / 2],
    ];
    for (let step = 0; step <= steps; step++) {
      const angle = Math.PI - (Math.PI * step) / steps;
      points.push([
        radius * Math.cos(angle),
        centre + radius * Math.sin(angle),
      ]);
    }
    return polygon(module, points);
  }
  const radius = Math.min(shape.radius, width / 2, height / 2);
  if (radius < 0.05) return module.CrossSection.square([width, height], true);
  const x = width / 2 - radius;
  const y = height / 2 - radius;
  const corners: [number, number, number][] = [
    [x, -y, -90],
    [x, y, 0],
    [-x, y, 90],
    [-x, -y, 180],
  ];
  const steps = arcSegments(radius, 90);
  const points: Vec2[] = corners.flatMap(([cx, cy, start]) =>
    Array.from({ length: steps + 1 }, (_, step) => {
      const angle = ((start + (90 * step) / steps) * Math.PI) / 180;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    }),
  );
  return polygon(module, points);
}

/** A flat stake growing out of the plate's lower edge, tip pointing down. */
function stakeOutline(
  module: ManifoldModule,
  shape: Shape,
  mount: Extract<TagDesign["mount"], { type: "stake" }>,
): CrossSection {
  const { width, length, side } = mount;
  const tip = Math.min(mount.tipLength, length - 2, width * 1.5);
  const x =
    side === "left"
      ? -shape.width / 2 + width / 2 + STAKE_TIP
      : side === "right"
        ? shape.width / 2 - width / 2 - STAKE_TIP
        : 0;
  const root = -shape.height / 2 + STAKE_ROOT;
  const end = -shape.height / 2 - length;
  return polygon(module, [
    [x - width / 2, root],
    [x + width / 2, root],
    [x + width / 2, end + tip],
    [x + STAKE_TIP / 2, end],
    [x - STAKE_TIP / 2, end],
    [x - width / 2, end + tip],
  ]);
}

function toMesh(solid: Manifold): MeshData {
  const mesh = solid.getMesh();
  const count = mesh.triVerts.length;
  const positions = new Float32Array(count * 3);
  for (let corner = 0; corner < count; corner++) {
    const vertex = (mesh.triVerts[corner] ?? 0) * mesh.numProp;
    for (let axis = 0; axis < 3; axis++)
      positions[corner * 3 + axis] = mesh.vertProperties[vertex + axis] ?? 0;
  }
  return { positions, triangles: count / 3 };
}

/**
 * Builds one tag lying flat on the print bed, centred on its plate. The body
 * is a single watertight solid; raised lettering is kept apart so a slicer
 * can give it its own extruder.
 */
export function buildTag(
  module: ManifoldModule,
  tag: TagDesign,
  name: string,
  fonts: (Font | undefined)[],
  { merged = false }: { merged?: boolean } = {},
): BuiltTag {
  const { Manifold } = module;
  const { thickness, reliefDepth } = tag;
  const plate = plateOutline(module, tag.shape);
  const cutters: Manifold[] = [];
  const raised: Manifold[] = [];

  let outline = plate;
  if (tag.mount.type === "stake")
    outline = plate.add(stakeOutline(module, tag.shape, tag.mount));
  else if (tag.mount.type === "hole") {
    const { diameter, margin } = tag.mount;
    cutters.push(
      module.CrossSection.circle(diameter / 2, arcSegments(diameter / 2))
        .translate(0, tag.shape.height / 2 - margin)
        .extrude(thickness),
    );
  } else if (tag.mount.type === "screws") {
    const { diameter, margin } = tag.mount;
    for (const sign of [-1, 1])
      cutters.push(
        module.CrossSection.circle(diameter / 2, arcSegments(diameter / 2))
          .translate(sign * (tag.shape.width / 2 - margin), 0)
          .extrude(thickness),
      );
  }
  let body = outline.extrude(thickness);

  // A decorative frame follows the plate edge only, not the stake.
  if (tag.frame.enabled) {
    const { inset, thickness: line } = tag.frame;
    const ring = plate
      .offset(-inset, "Round", 2, 32)
      .subtract(plate.offset(-(inset + line), "Round", 2, 32))
      .extrude(reliefDepth);
    (tag.frame.relief === "raised" ? raised : cutters).push(
      tag.frame.relief === "raised"
        ? ring.translate(0, 0, thickness)
        : ring.translate(0, 0, thickness - reliefDepth),
    );
  }

  const text: TextLayout[] = [];
  const zones = textZones(tag);
  // Kept index-aligned with `tag.layers`, which the checks rely on.
  tag.layers.forEach((layer, index) => {
    const font = fonts[index];
    const zone = zones[index];
    if (!font || !zone) {
      text[index] = emptyText();
      return;
    }
    const laid = layoutText(font, resolveText(layer.text, name), zone, {
      size: layer.size,
      lineHeight: layer.lineHeight,
      tracking: layer.tracking,
      align: layer.align,
    });
    text[index] = laid;
    if (!laid.contours.length) return;
    const letters = module.CrossSection.ofPolygons(
      laid.contours,
      "NonZero",
    ).extrude(reliefDepth);
    (layer.relief === "raised" ? raised : cutters).push(
      layer.relief === "raised"
        ? letters.translate(0, 0, thickness)
        : letters.translate(0, 0, thickness - reliefDepth),
    );
  });

  if (cutters.length) body = Manifold.difference([body, ...cutters]);
  let relief: Manifold | null = null;
  if (raised.length) {
    // Nothing raised may overhang the plate edge.
    relief = Manifold.intersection([
      Manifold.union(raised),
      plate.extrude(reliefDepth).translate(0, 0, thickness),
    ]);
  }
  for (const solid of [...cutters, ...raised]) solid.delete();

  if (body.isEmpty() || body.status() !== "NoError")
    throw new Error("Не удалось построить бирку с такими параметрами");
  let single: MeshData | undefined;
  if (relief && merged) single = toMesh(body.add(relief));
  const bounds = body.boundingBox();
  const size = {
    x: bounds.max[0] - bounds.min[0],
    y: bounds.max[1] - bounds.min[1],
    z: bounds.max[2] - bounds.min[2],
  };
  const volume = body.volume() + (relief?.volume() ?? 0);
  const result: BuiltTag = {
    body: toMesh(body),
    relief: null,
    single,
    size,
    center: {
      x: (bounds.min[0] + bounds.max[0]) / 2,
      y: (bounds.min[1] + bounds.max[1]) / 2,
    },
    volume,
    text,
  };
  body.delete();
  if (outline !== plate) outline.delete();
  plate.delete();
  if (relief) {
    result.relief = toMesh(relief);
    size.z = Math.max(size.z, thickness + reliefDepth);
    relief.delete();
  }
  return result;
}

/**
 * Loads the geometry kernel and the fonts, then builds the tag.
 * `merged` additionally unions body and lettering for single-colour export.
 */
export async function buildTagAsync(
  tag: TagDesign,
  name: string,
  merged = false,
) {
  const [module, fonts] = await Promise.all([
    loadManifold(),
    Promise.all(tag.layers.map((layer) => loadFont(layer.font))),
  ]);
  return buildTag(module, tag, name, fonts, { merged });
}
