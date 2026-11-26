import { expect, test } from "bun:test";
import { unzipSync } from "fflate";
import { stlTo3mf } from "./three-mf";

const sampleTriangle = [
  [0, 0, 0],
  [10, 0, 0],
  [0, 10, 0],
] as const;

function binaryStl() {
  const bytes = new Uint8Array(84 + 50);
  const view = new DataView(bytes.buffer);
  view.setUint32(80, 1, true);
  sampleTriangle.forEach((point, vertex) => {
    point.forEach((value, axis) => {
      view.setFloat32(84 + 12 + vertex * 12 + axis * 4, value, true);
    });
  });
  return bytes;
}

test("packages an OpenSCAD STL as millimetre 3MF for the print archive", () => {
  const bytes = stlTo3mf(binaryStl(), {
    name: "Томат & перец",
    baseColor: "зелёный",
    textColor: "белый",
  });
  const files = unzipSync(bytes);
  expect(Object.keys(files).sort()).toEqual([
    "3D/3dmodel.model",
    "[Content_Types].xml",
    "_rels/.rels",
  ]);
  const xml = new TextDecoder().decode(files["3D/3dmodel.model"]);
  expect(xml).toContain('unit="millimeter"');
  expect(xml).toContain("Томат &amp; перец");
  expect(xml).toContain('displaycolor="#28513EFF"');
  expect(xml).toContain('displaycolor="#FFFFFFFF"');
  expect(xml).toContain('<triangle v1="0" v2="1" v3="2"');
});

test("accepts OpenSCAD ASCII STL and rejects malformed output", () => {
  const ascii = new TextEncoder().encode(
    "solid tag\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 10 0 0\nvertex 0 10 0\nendloop\nendfacet\nendsolid tag",
  );
  expect(
    stlTo3mf(ascii, { name: "Томат", baseColor: "#123456", textColor: "white" })
      .length,
  ).toBeGreaterThan(100);
  expect(() =>
    stlTo3mf(new Uint8Array([1, 2, 3]), {
      name: "",
      baseColor: "",
      textColor: "",
    }),
  ).toThrow();
});

test("assigns three filament materials when accentColor is provided", () => {
  const ascii = new TextEncoder().encode(
    [
      "solid kids",
      "facet normal 0 0 1\nouter loop\nvertex 0 0 1\nvertex 5 0 1\nvertex 0 5 1\nendloop\nendfacet",
      "facet normal 0 0 1\nouter loop\nvertex 0 0 2.4\nvertex 5 0 2.4\nvertex 0 5 2.4\nendloop\nendfacet",
      "facet normal 0 0 1\nouter loop\nvertex 0 0 2.9\nvertex 5 0 2.9\nvertex 0 5 2.9\nendloop\nendfacet",
      "endsolid kids",
    ].join("\n"),
  );
  const bytes = stlTo3mf(ascii, {
    name: "Морковь",
    baseColor: "морковный",
    textColor: "мел",
    accentColor: "оливковый",
  });
  const xml = new TextDecoder().decode(unzipSync(bytes)["3D/3dmodel.model"]);
  expect(xml).toContain('displaycolor="#EB7C28FF"');
  expect(xml).toContain('displaycolor="#F2EAD9FF"');
  expect(xml).toContain('displaycolor="#7AA854FF"');
  expect(xml).toContain('p1="2"');
  expect(xml).toContain('p1="1"');
  expect(xml).toContain('p1="0"');
});
