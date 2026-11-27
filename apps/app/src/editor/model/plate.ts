import { type Printer, printer } from "./printer";

/** Tag centre on the bed, millimetres from the bed's front-left corner. */
type Placement = { x: number; y: number };

export type PlateLayout = {
  placements: Placement[];
  /** How many tags of this footprint the bed takes. */
  capacity: number;
  columns: number;
  rows: number;
};

/**
 * Shelf packing for identical footprints, each row centred on the bed. The
 * margin keeps clear of the filament cutter in the bed corner.
 */
export function layoutPlate(
  size: { x: number; y: number },
  count: number,
  gap: number,
  margin: number,
  machine: Printer = printer,
): PlateLayout {
  const { bed, deadZones } = machine;
  const from = (axis: "x" | "y") =>
    Math.max(
      margin,
      ...deadZones.map(
        ([x, y, w, h]) => (axis === "x" ? x + w : y + h) + gap / 2,
      ),
    );
  const left = from("x");
  const front = from("y");
  const columns = Math.max(
    0,
    Math.floor((bed.x - left - margin + gap) / (size.x + gap)),
  );
  const rows = Math.max(
    0,
    Math.floor((bed.y - front - margin + gap) / (size.y + gap)),
  );
  const capacity = columns * rows;
  const used = Math.max(1, Math.ceil(Math.min(count, capacity) / columns));
  // The block of rows is centred front to back, clear of the cutter corner.
  const frontEdge =
    front +
    Math.max(0, bed.y - front - margin - (used * size.y + (used - 1) * gap)) /
      2;
  const placements: Placement[] = [];
  for (let index = 0; index < Math.min(count, capacity); index++) {
    const row = Math.floor(index / columns);
    const inRow = Math.min(columns, Math.min(count, capacity) - row * columns);
    const start = (bed.x - (inRow * size.x + (inRow - 1) * gap)) / 2;
    placements.push({
      x: start + (index % columns) * (size.x + gap) + size.x / 2,
      y: frontEdge + row * (size.y + gap) + size.y / 2,
    });
  }
  return { placements, capacity, columns, rows };
}
