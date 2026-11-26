import { allShapes, type ShapeId } from "./data";

export type TagConfig = {
  shape: ShapeId;
  color: number;
  names: string[];
  mixed?: boolean;
};

export function parseNames(text: string) {
  return text
    .split(/\r?\n/)
    .map((value, index) => ({
      text: value.trim(),
      line: index + 1,
      length: Array.from(value.trim()).length,
    }))
    .filter((row) => row.text);
}

export function wrapName(name: string): string[] {
  const chars = Array.from(name.trim());
  if (chars.length <= 18) return [chars.join("")];
  const middle = Math.ceil(chars.length / 2);
  const spaces = chars.flatMap((char, index) => (char === " " ? [index] : []));
  const split =
    spaces.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle))[0] ??
    middle;
  return [
    chars.slice(0, split).join("").trim(),
    chars.slice(split).join("").trim(),
  ];
}

// Mixed kits alternate 10 cm stakes and 18 cm flags, also after list edits.
export function kitShapes(
  count: number,
  shape: ShapeId,
  mixed = false,
): ShapeId[] {
  return Array.from({ length: count }, (_, index) =>
    mixed ? (index % 2 === 0 ? "stake" : "flag") : shape,
  );
}

export function calculateKit(count: number, shape: ShapeId, mixed = false) {
  const original = kitShapes(count, shape, mixed).reduce(
    (sum, id) => sum + (allShapes.find((entry) => entry.id === id)?.price ?? 0),
    0,
  );
  const discount = count >= 30 ? 15 : count >= 15 ? 10 : 0;
  // The advertised full-season offer is 1,910 ₽; other configurations use exact volume pricing.
  const price =
    mixed && count === 30
      ? 1910
      : Math.round(original * (100 - discount)) / 100;
  return { original, discount, price };
}
