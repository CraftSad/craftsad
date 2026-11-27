import { beforeAll, describe, expect, test } from "bun:test";
import { checkTag } from "./checks";
import { type BuiltTag, buildTag } from "./geometry";
import { loadManifold, type ManifoldModule } from "./manifold";
import { layoutPlate } from "./plate";
import { printer } from "./printer";
import { createLayer, type TagDesign, tagSchema } from "./schema";
import { templates } from "./templates";
import { readFont } from "./testing";

let module: ManifoldModule;
beforeAll(async () => {
  module = await loadManifold();
});

const NAME = "Томат Бычье сердце";
const build = async (tag: TagDesign, name = NAME) =>
  buildTag(
    module,
    tag,
    name,
    await Promise.all(tag.layers.map((layer) => readFont(layer.font))),
    { merged: true },
  );
const design = (patch: object = {}) =>
  tagSchema.parse({ shape: { width: 60, height: 30, radius: 0 }, ...patch });
const PLATE = 60 * 30 * 2.4;
/** Bounds of the raised lettering, which the tests expect to exist. */
const reliefBox = (tag: BuiltTag) => {
  if (!tag.relief) throw new Error("the tag has no raised lettering");
  return box(tag.relief);
};
const finite = (mesh: BuiltTag["body"]) =>
  mesh.positions.every(Number.isFinite);
const box = (mesh: BuiltTag["body"]) => {
  const x: number[] = [];
  const y: number[] = [];
  const z: number[] = [];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    x.push(mesh.positions[i] ?? 0);
    y.push(mesh.positions[i + 1] ?? 0);
    z.push(mesh.positions[i + 2] ?? 0);
  }
  return {
    x: Math.max(...x) - Math.min(...x),
    y: Math.max(...y) - Math.min(...y),
    zMin: Math.min(...z),
    zMax: Math.max(...z),
    xMin: Math.min(...x),
    xMax: Math.max(...x),
    yMin: Math.min(...y),
    yMax: Math.max(...y),
  };
};

describe("tag geometry", () => {
  test("every template builds a sound solid that passes the print checks", async () => {
    for (const template of templates) {
      const built = await build(template.project.tag);
      expect(built.volume).toBeGreaterThan(500);
      expect(built.body.triangles).toBeGreaterThan(50);
      expect(finite(built.body)).toBe(true);
      expect(built.relief === null || finite(built.relief)).toBe(true);
      const errors = checkTag(template.project.tag, built).filter(
        (issue) => issue.level === "error",
      );
      expect(errors).toEqual([]);
    }
  });

  test("a plain plate has the requested size and its own volume", async () => {
    const tag = design({ layers: [createLayer()] });
    const built = await build(tag);
    const body = box(built.body);
    expect(body.x).toBeCloseTo(60, 4);
    expect(body.y).toBeCloseTo(30, 4);
    expect(body.zMin).toBeCloseTo(0, 4);
    expect(body.zMax).toBeCloseTo(2.4, 4);
    // The plate is untouched by raised text, which adds its own volume.
    const bare = await build(design());
    expect(bare.volume).toBeCloseTo(PLATE, 3);
    expect(built.volume - bare.volume).toBeGreaterThan(50);
    expect(built.volume - bare.volume).toBeLessThan(200);
    expect(built.relief?.triangles ?? 0).toBeGreaterThan(500);
    expect(reliefBox(built).zMin).toBeCloseTo(2.4, 4);
    expect(reliefBox(built).zMax).toBeCloseTo(3, 4);
    expect(built.single?.triangles).toBeGreaterThan(built.body.triangles);
  });

  test("rounded corners and a circle give smaller, still exact volumes", async () => {
    // Arcs are chords of at most 0.2 mm, so areas are 0.1 % short at worst.
    const near = (value: number, expected: number) =>
      expect(Math.abs(value - expected) / expected).toBeLessThan(0.001);
    const rounded = await build(
      design({ shape: { width: 60, height: 30, radius: 5 } }),
    );
    near(rounded.volume, PLATE - (4 - Math.PI) * 25 * 2.4);
    const round = await build(
      design({ shape: { kind: "ellipse", width: 40, height: 40 } }),
    );
    near(round.volume, Math.PI * 400 * 2.4);
    expect(box(round.body).x).toBeCloseTo(40, 3);
  });

  test("a stake grows out of the plate and fuses with it", async () => {
    const withStake = await build(
      design({ mount: { type: "stake", length: 50, width: 8, tipLength: 12 } }),
    );
    const body = box(withStake.body);
    // The length is measured from the plate edge; its root overlaps by 1 mm.
    expect(body.y).toBeCloseTo(30 + 50, 4);
    expect(body.x).toBeCloseTo(60, 4);
    expect(withStake.center.y).toBeLessThan(0);
    expect(withStake.volume).toBeGreaterThan(PLATE + 8 * 40 * 2.4);
    const flag = await build(
      design({
        mount: {
          type: "stake",
          length: 50,
          width: 8,
          tipLength: 12,
          side: "left",
        },
      }),
    );
    expect(box(flag.body).xMin).toBeCloseTo(-30, 4);
  });

  test("holes cut exactly their cylinder out of the plate", async () => {
    const hole = await build(
      design({ mount: { type: "hole", diameter: 4, margin: 6 } }),
    );
    expect(hole.volume).toBeCloseTo(PLATE - Math.PI * 4 * 2.4, 0);
    const screws = await build(
      design({ mount: { type: "screws", diameter: 3.5, margin: 6 } }),
    );
    expect(screws.volume).toBeCloseTo(PLATE - 2 * Math.PI * 1.75 ** 2 * 2.4, 0);
  });

  test("raised lettering sits on the plate and never overhangs its edge", async () => {
    const built = await build(
      design({
        layers: [{ ...createLayer(), size: 40, text: "Очень длинная надпись" }],
      }),
    );
    const plate = box(built.body);
    const relief = reliefBox(built);
    expect(relief.xMin).toBeGreaterThanOrEqual(plate.xMin - 0.01);
    expect(relief.xMax).toBeLessThanOrEqual(plate.xMax + 0.01);
    expect(relief.yMin).toBeGreaterThanOrEqual(plate.yMin - 0.01);
    expect(relief.yMax).toBeLessThanOrEqual(plate.yMax + 0.01);
    expect(relief.zMin).toBeCloseTo(2.4, 4);
  });

  test("engraved lettering is cut into the body as one solid", async () => {
    const plain = await build(design());
    const engraved = await build(
      design({ layers: [{ ...createLayer(), relief: "engraved" }] }),
    );
    expect(engraved.relief).toBeNull();
    expect(engraved.single).toBeUndefined();
    expect(engraved.volume).toBeLessThan(plain.volume);
    expect(engraved.volume).toBeGreaterThan(plain.volume - 400);
  });

  test("keeps one text report per layer, in layer order", async () => {
    const tag = design({
      layers: [
        { ...createLayer("Первая"), anchor: "top" },
        { ...createLayer("Вторая"), anchor: "bottom" },
      ],
    });
    // The second font failed to load: its report stays in place, empty.
    const built = buildTag(module, tag, NAME, [
      await readFont(tag.layers[0]?.font ?? ""),
      undefined,
    ]);
    expect(built.text).toHaveLength(2);
    expect(built.text[0]?.lines).toBe(1);
    expect(built.text[1]).toEqual(
      expect.objectContaining({ lines: 0, contours: [] }),
    );
  });

  test("the schema keeps mounts from swallowing the plate", async () => {
    const tag = design({ mount: { type: "hole", diameter: 500, margin: 1 } });
    expect(tag.mount).toEqual({ type: "hole", diameter: 20, margin: 2 });
    const built = await build(tag);
    expect(built.volume).toBeGreaterThan(PLATE / 2);
  });
});

describe("print checks", () => {
  test("flags fragile and impossible tags", async () => {
    const good = checkTag(design(), await build(design()));
    expect(good.filter((issue) => issue.level === "error")).toEqual([]);

    const thin = design({ thickness: 0.6 });
    expect(checkTag(thin, await build(thin)).map((i) => i.level)).toContain(
      "warning",
    );

    const through = design({
      reliefDepth: 2.4,
      layers: [{ ...createLayer(), relief: "engraved" }],
    });
    expect(
      checkTag(through, await build(through)).map((i) => i.level),
    ).toContain("error");
  });

  test("reports a tag larger than the printer bed", async () => {
    const huge = design({
      shape: { width: 200, height: 120 },
      mount: { type: "stake", length: 260, width: 8, tipLength: 12 },
    });
    const issues = checkTag(huge, await build(huge));
    expect(issues.some((issue) => issue.level === "error")).toBe(true);
  });

  test("mentions characters the font lacks", async () => {
    const tag = design({ layers: [createLayer()] });
    const issues = checkTag(tag, await build(tag, "Томат 中文"));
    const warning = issues.find((issue) =>
      issue.message.includes("нет символов"),
    );
    expect(warning?.message).toContain("中");
    expect(warning?.message).toContain("文");
  });
});

describe("plate layout", () => {
  test("packs identical footprints in centred rows", () => {
    const plate = layoutPlate({ x: 65, y: 97 }, 6, 6, 12);
    // (320 - 24 + 6) / 71 = 4 columns, (320 - 12 - 16 + 6) / 103 = 2 rows.
    expect(plate.columns).toBe(4);
    expect(plate.rows).toBe(2);
    expect(plate.capacity).toBe(8);
    expect(plate.placements).toHaveLength(6);
    for (const { x, y } of plate.placements) {
      expect(x - 32.5).toBeGreaterThanOrEqual(12);
      expect(x + 32.5).toBeLessThanOrEqual(320 - 12);
      expect(y - 48.5).toBeGreaterThanOrEqual(12);
      expect(y + 48.5).toBeLessThanOrEqual(320 - 12);
    }
  });

  test("keeps clear of the filament cutter in the bed corner", () => {
    const plate = layoutPlate({ x: 20, y: 20 }, 400, 2, 2);
    const corner = plate.placements[0];
    expect(corner?.x ?? 0).toBeGreaterThanOrEqual(9);
    expect(corner?.y ?? 0).toBeGreaterThanOrEqual(13);
    expect(plate.placements).toHaveLength(plate.capacity);
  });

  test("a footprint that does not fit has zero capacity", () => {
    expect(layoutPlate({ x: printer.bed.x, y: 40 }, 3, 6, 12).capacity).toBe(0);
  });
});
