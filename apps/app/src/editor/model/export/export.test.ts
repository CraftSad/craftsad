import { beforeAll, describe, expect, test } from "bun:test";
import { unzipSync } from "fflate";
import { setFontReader } from "../fonts";
import { buildTagAsync, type MeshData } from "../geometry";
import { loadManifold } from "../manifold";
import { createProject, projectSchema, resolveText } from "../schema";
import { fontFile, readFont } from "../testing";
import { batchNames, exportPrint, fileName } from "./print";
import { parseProject, serializeProject } from "./project";
import { encodeStl } from "./stl";
import { encode3mf } from "./three-mf";

const decoder = new TextDecoder();

beforeAll(async () => {
  setFontReader(fontFile);
  await loadManifold();
});

const cube = (size = 2): MeshData => {
  // Two triangles of a square lying on the bed; enough to exercise writers.
  const h = size / 2;
  return {
    positions: new Float32Array([
      -h,
      -h,
      0,
      h,
      -h,
      0,
      h,
      h,
      0,
      -h,
      -h,
      0,
      h,
      h,
      0,
      -h,
      h,
      0,
    ]),
    triangles: 2,
  };
};

describe("STL writer", () => {
  test("writes a binary STL with a header no reader mistakes for ASCII", () => {
    const buffer = encodeStl(cube(), "Томат");
    expect(buffer.byteLength).toBe(84 + 2 * 50);
    const view = new DataView(buffer);
    expect(view.getUint32(80, true)).toBe(2);
    const header = decoder.decode(buffer.slice(0, 20));
    expect(header.startsWith("3dbirka")).toBe(true);
    expect(header.startsWith("solid")).toBe(false);
    expect(view.getFloat32(84 + 8, true)).toBeCloseTo(1, 5);
    expect(view.getFloat32(84 + 12, true)).toBeCloseTo(-1, 5);
    expect(view.getFloat32(84 + 20, true)).toBeCloseTo(0, 5);
  });
});

describe("3MF writer", () => {
  const settingsOf = (bytes: Uint8Array) =>
    decoder.decode(
      unzipSync(bytes)["Metadata/model_settings.config"] ?? new Uint8Array(),
    );

  test("packs the four parts a QIDI Studio plate needs", () => {
    const files = unzipSync(
      encode3mf(
        [
          {
            name: "Томат",
            parts: [{ name: "Корпус", mesh: cube(), extruder: 1 }],
            x: 10,
            y: 20,
          },
        ],
        [{ name: "Томат", color: "#f4efe4" }],
        "Мои бирки",
      ),
    );
    expect(Object.keys(files).sort()).toEqual([
      "3D/3dmodel.model",
      "Metadata/model_settings.config",
      "[Content_Types].xml",
      "_rels/.rels",
    ]);
    const model = decoder.decode(files["3D/3dmodel.model"]);
    expect(model).toContain('unit="millimeter"');
    expect(model).toContain('<metadata name="Title">Мои бирки</metadata>');
    expect(model).toContain('displaycolor="#F4EFE4FF"');
    expect(model).toContain('transform="1 0 0 0 1 0 0 0 1 10 20 0"');
    // No slicer identity: the slicer then imports geometry and keeps the
    // user's own printer and filament presets.
    expect(model).not.toContain("OrcaSlicer");
    expect(model).not.toContain("BambuStudio");
  });

  test("gives body and lettering their own extruders", () => {
    const settings = settingsOf(
      encode3mf(
        [
          {
            name: "Томат & перец",
            parts: [
              { name: "Корпус", mesh: cube(), extruder: 1 },
              { name: "Надпись", mesh: cube(1), extruder: 2 },
            ],
            x: 0,
            y: 0,
          },
        ],
        [
          { name: "Корпус", color: "#28513e" },
          { name: "Надпись", color: "#ffffff" },
        ],
        "Бирки",
      ),
    );
    expect(settings).toContain(
      '<metadata key="name" value="Томат &amp; перец"/>',
    );
    // Mesh objects take ids 2 and 3; the two-part object built on them is 4.
    // A part's id is the mesh its component points to.
    expect(settings).toContain('<object id="4">');
    expect(settings).toContain(
      '<part id="2" subtype="model_part"><metadata key="name" value="Корпус"/><metadata key="extruder" value="1"/></part>',
    );
    expect(settings).toContain(
      '<part id="3" subtype="model_part"><metadata key="name" value="Надпись"/><metadata key="extruder" value="2"/></part>',
    );
    expect(
      decoder.decode(
        unzipSync(
          encode3mf(
            [
              {
                name: "x",
                parts: [
                  { name: "Корпус", mesh: cube(), extruder: 1 },
                  { name: "Надпись", mesh: cube(1), extruder: 2 },
                ],
                x: 0,
                y: 0,
              },
            ],
            [
              { name: "a", color: "#000000" },
              { name: "b", color: "#ffffff" },
            ],
            "x",
          ),
        )["3D/3dmodel.model"] ?? new Uint8Array(),
      ),
    ).toContain(
      '<components><component objectid="2"/><component objectid="3"/></components>',
    );
  });

  test("stores identical meshes once and references them from every copy", () => {
    const mesh = cube();
    const model = decoder.decode(
      unzipSync(
        encode3mf(
          [1, 2, 3].map((n) => ({
            name: `Томат (${n})`,
            parts: [{ name: "Томат", mesh, extruder: 1 }],
            x: n * 10,
            y: 0,
          })),
          [{ name: "Томат", color: "#000000" }],
          "Копии",
        ),
      )["3D/3dmodel.model"] ?? new Uint8Array(),
    );
    expect(model.match(/<mesh>/g)).toHaveLength(1);
    expect(model.match(/<item objectid=/g)).toHaveLength(3);
  });

  test("rounds coordinates to micrometres and shares vertices", () => {
    const model = decoder.decode(
      unzipSync(
        encode3mf(
          [
            {
              name: "x",
              parts: [{ name: "x", mesh: cube(), extruder: 1 }],
              x: 0,
              y: 0,
            },
          ],
          [{ name: "x", color: "#000000" }],
          "x",
        ),
      )["3D/3dmodel.model"] ?? new Uint8Array(),
    );
    expect(model.match(/<vertex /g)).toHaveLength(4);
    expect(model.match(/<triangle /g)).toHaveLength(2);
    expect(model).toContain('x="1"');
  });
});

describe("project files", () => {
  test("survive a save and load round trip", () => {
    const project = createProject();
    project.title = "Перец «Калифорнийское чудо»";
    expect(parseProject(serializeProject(project))).toEqual(project);
  });

  test("reject files that are not projects", () => {
    expect(() => parseProject("not json")).toThrow();
    expect(() => parseProject("[1,2,3]")).toThrow();
    expect(() => parseProject(JSON.stringify({ version: 99 }))).toThrow();
  });

  test("repair damaged values instead of refusing the file", () => {
    const project = parseProject(
      JSON.stringify({
        version: 1,
        title: 42,
        tag: {
          shape: { width: "wide", height: 9999, kind: "blob" },
          thickness: -5,
          layers: [
            { text: "Томат", font: "retired-font", anchor: "somewhere" },
            { text: "Перец", id: "same" },
            { text: "Укроп", id: "same" },
          ],
        },
        batch: { copies: "many", names: ["a", "b", "c"] },
      }),
    );
    expect(project.title).toBe("Моя бирка");
    expect(project.tag.shape.width).toBe(65);
    expect(project.tag.shape.height).toBe(120);
    expect(project.tag.thickness).toBe(0.6);
    expect(project.tag.layers).toHaveLength(3);
    expect(project.tag.layers[0]).toEqual(
      expect.objectContaining({
        text: "Томат",
        font: "manrope-700",
        anchor: "middle",
      }),
    );
    const ids = project.tag.layers.map((layer) => layer.id);
    expect(new Set(ids).size).toBe(3);
    expect(project.batch.copies).toBe(1);
  });
});

describe("print export", () => {
  const project = (patch: object = {}) =>
    projectSchema.parse({ ...createProject(), ...patch });

  test("expands copies of every batch line, skipping blank ones", () => {
    const names = batchNames(
      project({ batch: { names: ["Томат", "  ", "Перец"], copies: 2 } }),
    );
    expect(names).toEqual(["Томат", "Томат", "Перец", "Перец"]);
    expect(
      batchNames(project({ title: "Одинокая", batch: { names: [] } })),
    ).toEqual(["Одинокая"]);
  });

  test("builds a two-colour plate with one item per tag", async () => {
    const result = await exportPrint(
      project({
        title: "Рассада",
        batch: { names: ["Томат", "Перец"], copies: 2, gap: 6, margin: 12 },
      }),
      "3mf",
    );
    expect(result.twoColour).toBe(true);
    expect(result.count).toBe(4);
    expect(result.filename).toBe("Рассада.3mf");
    const files = unzipSync(new Uint8Array(await result.blob.arrayBuffer()));
    const model = decoder.decode(files["3D/3dmodel.model"] ?? new Uint8Array());
    const settings = decoder.decode(
      files["Metadata/model_settings.config"] ?? new Uint8Array(),
    );
    expect(model.match(/<item objectid=/g)).toHaveLength(4);
    // Two distinct names, so two bodies and two letterings.
    expect(model.match(/<mesh>/g)).toHaveLength(4);
    expect(settings.match(/key="extruder" value="2"/g)).toHaveLength(4);
    expect(settings).toContain('value="Томат (2)"');
    const xs = [
      ...model.matchAll(
        /<item objectid="\d+" transform="[^"]* ([\d.]+) ([\d.]+) 0"\/>/g,
      ),
    ].map((m) => Number(m[1]));
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(60);
  });

  test("zips single-colour STLs named after their tag", async () => {
    const result = await exportPrint(
      project({ title: "Рассада", batch: { names: ["Томат", "Перец"] } }),
      "stl",
    );
    expect(result.twoColour).toBe(false);
    expect(result.filename).toBe("Рассада-stl.zip");
    const files = unzipSync(new Uint8Array(await result.blob.arrayBuffer()));
    expect(Object.keys(files).sort()).toEqual([
      "001-Томат.stl",
      "002-Перец.stl",
    ]);
    expect(Object.values(files)[0]?.byteLength).toBeGreaterThan(84);
  });

  test("refuses a batch that does not fit the bed", async () => {
    const long = projectSchema.parse({
      ...createProject(),
      tag: {
        ...createProject().tag,
        mount: { type: "stake", length: 260, width: 8, tipLength: 12 },
      },
      batch: { names: ["Томат"], copies: 20 },
    });
    await expect(exportPrint(long, "3mf")).rejects.toThrow(
      "На стол помещается",
    );
  });
});

test("{name} is replaced everywhere in a layer's text", () => {
  expect(resolveText("{name} · {name} 2026", "Томат")).toBe(
    "Томат · Томат 2026",
  );
  expect(resolveText("Теплица", "Томат")).toBe("Теплица");
});

test("file names stay safe on every desktop", () => {
  expect(fileName("Томат Бычье сердце")).toBe("Томат-Бычье-сердце");
  expect(fileName('Перец: "чудо"?/\\')).toBe("Перец-чудо");
  expect(fileName("   ")).toBe("birka");
  expect(fileName("a".repeat(100))).toHaveLength(60);
});
