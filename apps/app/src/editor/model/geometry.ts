import type { CrossSection, Manifold } from "manifold-3d";
import type { Font } from "opentype.js";
import { loadFont } from "./fonts";
import { loadManifold, type ManifoldModule } from "./manifold";
import { arcSegments, mountCenters, platePoints, stakePoints } from "./outline";
import { resolveText, type TagDesign } from "./schema";
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

/** Winding is irrelevant under NonZero, so outlines may run either way. */
function polygon(module: ManifoldModule, points: Vec2[]): CrossSection {
  return module.CrossSection.ofPolygons([points], "NonZero");
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
  const owned = new Set<CrossSection | Manifold>();
  const own = <T extends CrossSection | Manifold>(object: T): T => {
    owned.add(object);
    return object;
  };
  try {
    const points = platePoints(tag.shape);
    const plate = own(polygon(module, points));
    const cutters: Manifold[] = [];
    const raised: Manifold[] = [];
    const mount = tag.mount;
    let outline = plate;
    if (mount.type === "stake") {
      const stake = own(polygon(module, stakePoints(tag.shape, mount, points)));
      outline = own(plate.add(stake));
    } else if (mount.type === "hole" || mount.type === "screws") {
      const r = mount.diameter / 2;
      for (const [x, y] of mountCenters(tag.shape, mount)) {
        const circle = own(module.CrossSection.circle(r, arcSegments(r)));
        const translated = own(circle.translate(x, y));
        cutters.push(own(translated.extrude(thickness)));
      }
    }
    let body = own(outline.extrude(thickness));

    // A decorative frame follows the plate edge only, not the stake.
    if (tag.frame.enabled) {
      const { inset, thickness: line } = tag.frame;
      const outer = own(plate.offset(-inset, "Round", 2, 32));
      const inner = own(plate.offset(-(inset + line), "Round", 2, 32));
      const ring = own(own(outer.subtract(inner)).extrude(reliefDepth));
      const isRaised = tag.frame.relief === "raised";
      (isRaised ? raised : cutters).push(
        own(
          ring.translate(0, 0, isRaised ? thickness : thickness - reliefDepth),
        ),
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
      const contours = own(
        module.CrossSection.ofPolygons(laid.contours, "NonZero"),
      );
      const letters = own(contours.extrude(reliefDepth));
      const isRaised = layer.relief === "raised";
      (isRaised ? raised : cutters).push(
        own(
          letters.translate(
            0,
            0,
            isRaised ? thickness : thickness - reliefDepth,
          ),
        ),
      );
    });

    if (cutters.length) body = own(Manifold.difference([body, ...cutters]));
    let relief: Manifold | null = null;
    if (raised.length) {
      // Nothing raised may overhang the plate edge.
      const combined = own(Manifold.union(raised));
      const mask = own(
        own(plate.extrude(reliefDepth)).translate(0, 0, thickness),
      );
      const clipped = own(Manifold.intersection([combined, mask]));
      if (!clipped.isEmpty()) relief = clipped;
    }

    if (body.isEmpty() || body.status() !== "NoError")
      throw new Error("Не удалось построить бирку с такими параметрами");
    const single = relief && merged ? toMesh(own(body.add(relief))) : undefined;
    const bounds = body.boundingBox();
    const size = {
      x: bounds.max[0] - bounds.min[0],
      y: bounds.max[1] - bounds.min[1],
      z: relief ? thickness + reliefDepth : bounds.max[2] - bounds.min[2],
    };
    const volume = body.volume() + (relief?.volume() ?? 0);
    return {
      body: toMesh(body),
      relief: relief ? toMesh(relief) : null,
      single,
      size,
      center: {
        x: (bounds.min[0] + bounds.max[0]) / 2,
        y: (bounds.min[1] + bounds.max[1]) / 2,
      },
      volume,
      text,
    };
  } finally {
    for (const object of Array.from(owned).reverse()) object.delete();
  }
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
