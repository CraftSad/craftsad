import { describe, expect, test } from "bun:test";
import { DEFAULT_FONT, type TagDesign, tagSchema } from "./schema";
import { readFont } from "./testing";
import { layoutText, MIN_FONT_SIZE, type TextStyle, type Zone } from "./text";
import { textZones } from "./zones";

const zone: Zone = { x: 0, y: 0, width: 55, height: 17 };
const auto: TextStyle = {
  size: 0,
  lineHeight: 1.1,
  tracking: 0,
  align: "center",
};
const layout = async (
  text: string,
  style: Partial<TextStyle> = {},
  area: Zone = zone,
) =>
  layoutText(await readFont(DEFAULT_FONT), text, area, { ...auto, ...style });
const xOf = (contours: number[][][]) => contours.flat().map((p) => p[0] ?? 0);
const yOf = (contours: number[][][]) => contours.flat().map((p) => p[1] ?? 0);
const bounds = (contours: number[][][]) => {
  const xs = xOf(contours);
  const ys = yOf(contours);
  expect(xs.length).toBeGreaterThan(0);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    bottom: Math.min(...ys),
    top: Math.max(...ys),
  };
};

describe("text layout", () => {
  test("a short name fills the zone on one line, centred", async () => {
    const laid = await layout("Томат");
    expect(laid.lines).toBe(1);
    expect(laid.fontSize).toBeCloseTo(zone.height / 1.1, 0);
    const box = bounds(laid.contours);
    expect(Math.abs(box.left + box.right)).toBeLessThan(0.6);
    expect(Math.abs(box.bottom + box.top)).toBeLessThan(0.6);
  });

  test("a long name wraps into two larger lines instead of shrinking", async () => {
    const wrapped = await layout("Томат Бычье сердце");
    // The largest size that keeps the name on a single line:
    const single = await layout("Томат Бычье сердце", { size: 5.2 });
    expect(single.lines).toBe(1);
    expect(wrapped.lines).toBe(2);
    expect(wrapped.overflow).toBe(false);
    expect(wrapped.fontSize).toBeGreaterThan(single.fontSize + 1.5);
  });

  test("ink never leaves its zone unless the text cannot fit", async () => {
    for (const text of [
      "Томат",
      "Томат Бычье сердце",
      "Перец Калифорнийское чудо",
      "Огурец\nЗозуля",
    ]) {
      const laid = await layout(text);
      const box = bounds(laid.contours);
      expect(box.right - box.left).toBeLessThanOrEqual(zone.width + 0.01);
      expect(box.top - box.bottom).toBeLessThanOrEqual(zone.height + 0.01);
    }
  });

  test("reports text that does not fit and still prints the first lines", async () => {
    const laid = await layout("Огурец\nЗозуля\nГерман\nНежинский\nАпрельский", {
      size: 6,
    });
    expect(laid.overflow).toBe(true);
    expect(laid.lines).toBe(3);
  });

  test("an overlong name stops shrinking at the printable size", async () => {
    const laid = await layout("очень длинное название сорта".repeat(30));
    expect(laid.overflow).toBe(true);
    expect(laid.fontSize).toBe(MIN_FONT_SIZE);
    expect(laid.lines).toBeLessThanOrEqual(3);
  });

  test("lists characters the font cannot draw", async () => {
    const laid = await layout("Томат 中文 🍅");
    expect(laid.missing).toEqual(["中", "文", "🍅"]);
  });

  test("honours explicit line breaks from any platform", async () => {
    expect((await layout("Огурец\r\nЗозуля")).lines).toBe(2);
    expect((await layout("Огурец\rЗозуля")).lines).toBe(2);
  });

  test("alignment moves the block inside the zone", async () => {
    // Ink starts a glyph's side bearing inside the advance box.
    const left = bounds((await layout("Томат", { align: "left" })).contours);
    const right = bounds((await layout("Томат", { align: "right" })).contours);
    expect(left.left).toBeGreaterThan(-zone.width / 2 - 0.01);
    expect(left.left).toBeLessThan(-zone.width / 2 + 0.4);
    expect(right.right).toBeGreaterThan(zone.width / 2 - 0.4);
    expect(right.right).toBeLessThan(zone.width / 2 + 0.01);
  });

  test("tabs are spaced like words and tracking matches the drawn word gap", async () => {
    const style = { size: 8, align: "left" } as const;
    const plain = await layout("А А", style);
    expect(await layout("А\tА", style)).toEqual(plain);
    const tracked = await layout("А А", { ...style, tracking: 0.1 });
    const advance =
      bounds(tracked.contours).right - bounds(plain.contours).right;
    expect(advance).toBeCloseTo(tracked.width - plain.width, 5);
  });

  test("tracking widens the text", async () => {
    const plain = await layout("Томат");
    const wide = await layout("Томат", { tracking: 0.1, size: 8 });
    const narrow = await layout("Томат", { size: 8 });
    expect(wide.width).toBeGreaterThan(narrow.width + 3);
    expect(wide.width).toBeLessThanOrEqual(zone.width);
    expect(plain.width).toBeGreaterThan(0);
  });

  test("returns nothing for empty text or a degenerate zone", async () => {
    expect((await layout("   ")).contours).toEqual([]);
    expect((await layout("Томат", {}, { ...zone, width: 0 })).contours).toEqual(
      [],
    );
  });
});

describe("text zones", () => {
  const tag = (layers: object[], extra: object = {}) =>
    tagSchema.parse({
      shape: { width: 60, height: 30 },
      layers,
      ...extra,
    });

  /** The single zone of a one-layer tag; there is always exactly one. */
  const only = (tag: TagDesign) => {
    const zones = textZones(tag);
    expect(zones).toHaveLength(1);
    return zones[0] ?? { x: 0, y: 0, width: -1, height: -1 };
  };

  test("layers keep their order and share the height by weight", () => {
    // Zones follow `layers` order; the weight only decides how tall each is.
    const zones = textZones(
      tag([
        { anchor: "bottom", weight: 1 },
        { anchor: "top", weight: 3 },
      ]),
    );
    expect(zones).toHaveLength(2);
    const bottom = zones[0] ?? { x: 0, y: 0, width: -1, height: -1 };
    const top = zones[1] ?? { x: 0, y: 0, width: -1, height: -1 };
    // 30 mm split 1:3, less the 5 mm inset on every side of a band.
    expect(bottom.height).toBeCloseTo(30 / 4 - 5, 5);
    expect(top.height).toBeCloseTo(30 * 0.75 - 5, 5);
    expect(top.y).toBeGreaterThan(0);
    expect(bottom.y).toBeLessThan(0);
    expect(top.y + top.height / 2).toBeCloseTo(15 - 5, 5);
    expect(bottom.y - bottom.height / 2).toBeCloseTo(-15 + 5, 5);
  });

  test("a hole pushes the top zone below it", () => {
    const free = only(tag([{ anchor: "top" }]));
    const underHole = only(
      tag([{ anchor: "top" }], {
        mount: { type: "hole", diameter: 4, margin: 6 },
      }),
    );
    expect(underHole.y + underHole.height / 2).toBeCloseTo(15 - 6 - 2 - 1.2, 5);
    expect(underHole.height).toBeLessThan(free.height);
  });

  test("zones follow the plate when it is resized", () => {
    const small = only(tag([{ anchor: "middle" }]));
    const large = only(
      tag([{ anchor: "middle" }], { shape: { width: 120, height: 60 } }),
    );
    expect(large.width).toBeGreaterThan(small.width);
    expect(large.height).toBeGreaterThan(small.height);
  });
});
