import { cornerRadius } from "./outline";
import type { TagDesign } from "./schema";
import type { Zone } from "./text";

/** Clearance kept between lettering and holes. */
const HOLE_CLEARANCE = 1.2;
/** Clearance between lettering and a decorative frame. */
const FRAME_CLEARANCE = 0.8;
const SLOT_ORDER = { top: 0, middle: 1, bottom: 2 } as const;

/** Narrowest width of the plate outline between two heights. */
function bandWidth(
  shape: TagDesign["shape"],
  bottom: number,
  top: number,
): number {
  const { width, height } = shape;
  if (shape.kind === "rounded") {
    const radius = cornerRadius(shape);
    const edge = Math.max(Math.abs(bottom), Math.abs(top));
    const rise = Math.max(0, edge - (height / 2 - radius));
    return (
      width - 2 * radius + 2 * Math.sqrt(Math.max(0, radius ** 2 - rise ** 2))
    );
  }
  if (shape.kind === "ellipse") {
    const edge = Math.max(Math.abs(bottom), Math.abs(top));
    return edge >= height / 2
      ? 0
      : width * Math.sqrt(1 - ((2 * edge) / height) ** 2);
  }
  // A tongue is a rectangle topped by a semicircle of the full width.
  const radius = Math.min(width / 2, height);
  const centre = height / 2 - radius;
  return top <= centre
    ? 2 * radius
    : 2 * Math.sqrt(Math.max(radius ** 2 - (top - centre) ** 2, 0));
}

/**
 * Where each layer's text may go, in the order of `tag.layers`. Layers stack
 * top to bottom and share the plate height by weight, so resizing the plate
 * or adding a hole moves the lettering instead of letting it run off.
 */
export function textZones(tag: TagDesign): Zone[] {
  const { shape, mount, frame } = tag;
  const height = shape.height;
  const framePad = frame.enabled
    ? frame.inset + frame.thickness + FRAME_CLEARANCE
    : 0;
  const order = tag.layers
    .map((layer, index) => ({ layer, index }))
    .sort((a, b) => SLOT_ORDER[a.layer.anchor] - SLOT_ORDER[b.layer.anchor]);
  const totalWeight = tag.layers.reduce((sum, layer) => sum + layer.weight, 0);
  // On an ellipse the poles are too narrow for text, so the layers only share
  // the middle of the height, where a band is close to the full width.
  const usable = shape.kind === "ellipse" ? height * 0.54 : height;
  let top = usable / 2;
  const zones: Zone[] = new Array(tag.layers.length);
  for (const { layer, index } of order) {
    const bottom = top - (usable * layer.weight) / totalWeight;
    const pad = layer.inset + framePad;
    let zoneTop = Math.min(top, height / 2 - pad);
    const zoneBottom = Math.max(bottom, -height / 2 + pad);
    if (mount.type === "hole")
      zoneTop = Math.min(
        zoneTop,
        height / 2 - mount.margin - mount.diameter / 2 - HOLE_CLEARANCE,
      );
    // Measured after holes trim the band: a lower band is a wider one.
    let width = Math.min(
      shape.width - 2 * pad,
      bandWidth(shape, zoneBottom, zoneTop) - 2 * pad,
    );
    if (mount.type === "screws")
      width = Math.min(
        width,
        shape.width - 2 * (mount.margin + mount.diameter / 2 + HOLE_CLEARANCE),
      );
    zones[index] = {
      x: layer.offsetX,
      y: (zoneTop + zoneBottom) / 2 + layer.offsetY,
      width: Math.max(width, 0),
      height: Math.max(zoneTop - zoneBottom, 0),
    };
    top = bottom;
  }
  return zones;
}
