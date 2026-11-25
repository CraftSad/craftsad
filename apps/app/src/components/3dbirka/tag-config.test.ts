import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { calculateKit, kitShapes, parseNames, wrapName } from "./tag-config";

describe("kit pricing and inscriptions", () => {
  test("ignores blank lines and retains source line numbers", () => {
    assert.deepEqual(parseNames("\n Томат \r\n \nПерец"), [
      { text: "Томат", line: 2, length: 5 },
      { text: "Перец", line: 4, length: 5 },
    ]);
  });
  test("wraps at 19 characters, including names without spaces", () => {
    for (const length of [18, 19, 28, 29]) {
      const name = "А".repeat(length);
      assert.equal(wrapName(name).length, length <= 18 ? 1 : 2);
      assert.equal(wrapName(name).join(""), name);
    }
    assert.deepEqual(wrapName("Перец Калифорнийское чудо"), [
      "Перец Калифорнийское",
      "чудо",
    ]);
  });
  test("applies each volume threshold for all shapes", () => {
    for (const [shape, unit] of [
      ["stake", 60],
      ["flag", 90],
      ["hanging", 70],
    ] as const) {
      for (const count of [0, 1, 14, 15, 29, 30, 31]) {
        const discount = count >= 30 ? 15 : count >= 15 ? 10 : 0;
        assert.deepEqual(calculateKit(count, shape), {
          original: count * unit,
          discount,
          price: (count * unit * (100 - discount)) / 100,
        });
      }
    }
  });
  test("preserves a mixed kit and recalculates after editing", () => {
    assert.equal(
      kitShapes(30, "stake", true).filter((shape) => shape === "flag").length,
      15,
    );
    assert.deepEqual(calculateKit(30, "stake", true), {
      original: 2250,
      discount: 15,
      price: 1910,
    });
    assert.equal(calculateKit(29, "stake", true).price, 1944);
    assert.equal(calculateKit(30, "stake").price, 1530);
  });
});
