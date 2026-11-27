export type Printer = {
  id: "qidi-plus5";
  name: string;
  /** Build volume in millimetres. */
  bed: { x: number; y: number; z: number };
  nozzle: number;
  /** Slice height the printability rules assume. */
  layerHeight: number;
  /** Width of one printed wall. */
  wall: number;
  /** Areas the stock filament cutter blocks, as [x, y, w, h] from the bed corner. */
  deadZones: [number, number, number, number][];
};

/** QIDI Plus 5, per the official specification sheet. */
export const printer: Printer = {
  id: "qidi-plus5",
  name: "QIDI Plus 5",
  bed: { x: 320, y: 320, z: 300 },
  nozzle: 0.4,
  layerHeight: 0.2,
  wall: 0.42,
  // "Lower-left 9x13 mm area is non-printable by default."
  deadZones: [[0, 0, 9, 13]],
};
