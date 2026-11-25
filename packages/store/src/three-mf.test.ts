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
