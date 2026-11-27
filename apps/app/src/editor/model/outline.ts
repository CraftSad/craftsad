import type { Shape, TagDesign } from "./schema";
import type { Vec2 } from "./text";

/** Longest chord of an approximated arc, millimetres. */
const ARC_STEP = 0.2;
/** Width left at the pointed end of a stake so it prints as a flat tip. */
const STAKE_TIP = 1.6;
/** Overlap that fuses the stake into the plate. */
const STAKE_ROOT = 1;

export const arcSegments = (radius: number, degrees = 360) =>
  Math.min(
    180,
    Math.max(8, Math.ceil((degrees * Math.PI * radius) / 180 / ARC_STEP)),
  );

/** The same radius limit and square cutoff used for the extruded plate. */
export function cornerRadius({ radius, width, height }: Shape): number {
  const limit = Math.min(radius, width / 2, height / 2);
  return limit < 0.05 ? 0 : limit;
}

function* edges(points: Vec2[]) {
  let previous = points.at(-1);
  for (const point of points) {
    if (previous) yield [previous, point] as const;
    previous = point;
  }
}

/** Signed distance to the convex, counter-clockwise plate contour. */
export function plateClearance(points: Vec2[], [x, y]: Vec2): number {
  let distance = Infinity;
  let inside = true;
  for (const [[ax, ay], [bx, by]] of edges(points)) {
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared < 1e-20) continue;
    if (dx * (y - ay) - dy * (x - ax) < 0) inside = false;
    const t = Math.max(
      0,
      Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSquared),
    );
    distance = Math.min(distance, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return inside ? distance : -distance;
}

export function mountCenters(
  shape: Shape,
  mount: Extract<TagDesign["mount"], { type: "hole" | "screws" }>,
): Vec2[] {
  if (mount.type === "hole") return [[0, shape.height / 2 - mount.margin]];
  const x = shape.width / 2 - mount.margin;
  return [
    [-x, 0],
    [x, 0],
  ];
}

export function platePoints(shape: Shape): Vec2[] {
  const { width, height } = shape;
  if (shape.kind === "ellipse") {
    // Include the four extrema so the outline has the requested dimensions.
    const steps = Math.ceil(arcSegments(Math.max(width, height) / 2) / 4) * 4;
    return Array.from({ length: steps }, (_, step) => {
      const angle = (2 * Math.PI * step) / steps;
      return [(width / 2) * Math.cos(angle), (height / 2) * Math.sin(angle)];
    });
  }
  if (shape.kind === "tongue") {
    // The semicircle may not be taller than the plate, which caps the width.
    const radius = Math.min(width / 2, height);
    const centre = height / 2 - radius;
    const steps = 2 * Math.ceil(arcSegments(radius, 180) / 2);
    const points: Vec2[] = [
      [-radius, -height / 2],
      [radius, -height / 2],
    ];
    for (let step = 0; step <= steps; step++) {
      const angle = (Math.PI * step) / steps;
      points.push([
        radius * Math.cos(angle),
        centre + radius * Math.sin(angle),
      ]);
    }
    return points;
  }
  const radius = cornerRadius(shape);
  if (!radius)
    return [
      [-width / 2, -height / 2],
      [width / 2, -height / 2],
      [width / 2, height / 2],
      [-width / 2, height / 2],
    ];
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
  return points;
}

/** A flat stake growing out of the plate's lower edge, tip pointing down. */
export function stakePoints(
  shape: Shape,
  mount: Extract<TagDesign["mount"], { type: "stake" }>,
  plate: Vec2[],
): Vec2[] {
  const { width, length, side } = mount;
  const tip = Math.min(mount.tipLength, length - 2, width * 1.5);
  const halfPlate =
    shape.kind === "tongue"
      ? Math.min(shape.width / 2, shape.height)
      : shape.width / 2;
  const offset = halfPlate - width / 2 - STAKE_TIP;
  const sideOffset =
    shape.kind === "rounded" && !cornerRadius(shape)
      ? offset
      : Math.max(0, offset);
  const x = side === "left" ? -sideOffset : side === "right" ? sideOffset : 0;
  let bottom = Infinity;
  let top = -Infinity;
  // Intersect the stake's centre line with the same contour we extrude.
  for (const [a, b] of edges(plate)) {
    if (a[0] === b[0] || x < Math.min(a[0], b[0]) || x > Math.max(a[0], b[0]))
      continue;
    const y = a[1] + ((x - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
    bottom = Math.min(bottom, y);
    top = Math.max(top, y);
  }
  const root = bottom + Math.min(STAKE_ROOT, (top - bottom) / 2);
  const end = -shape.height / 2 - length;
  return [
    [x - width / 2, root],
    [x + width / 2, root],
    [x + width / 2, end + tip],
    [x + STAKE_TIP / 2, end],
    [x - STAKE_TIP / 2, end],
    [x - width / 2, end + tip],
  ];
}
