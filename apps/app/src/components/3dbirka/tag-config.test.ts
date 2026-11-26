import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { getTagVisual, presets, shapeToSeries } from "./data";
import { detectPlantMotif } from "./series-motifs";
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
      ["slate-contour", 120],
      ["slate-tall", 145],
      ["kids-auto", 145],
      ["kids-hedgehog", 150],
      ["provence-auto", 135],
      ["provence-watering", 145],
    ] as const) {
      for (const count of [0, 1, 14, 15, 29, 30, 31]) {
        const discount = count >= 30 ? 15 : count >= 15 ? 10 : 0;
        assert.deepEqual(calculateKit(count, shape), {
          original: count * unit,
          discount,
          price: Math.round(count * unit * (100 - discount)) / 100,
        });
      }
    }
  });
  test("resolves series, motifs, figurines, and plaques for themed collections", () => {
    assert.equal(shapeToSeries("stake"), "classic");
    assert.equal(shapeToSeries("slate-contour"), "slate");
    assert.equal(shapeToSeries("kids-auto"), "kids");
    assert.equal(shapeToSeries("provence-auto"), "provence");

    assert.equal(detectPlantMotif("Томат Бычье сердце"), "tomato");
    assert.equal(detectPlantMotif("Клубника Елизавета"), "strawberry");
    assert.equal(detectPlantMotif("Лаванда"), "lavender");
    assert.equal(detectPlantMotif("Арбуз Огонёк"), "pumpkin");
    assert.equal(detectPlantMotif("Огонёк"), "pepper");
    assert.equal(detectPlantMotif("Малиновка"), "tomato");
    assert.equal(detectPlantMotif("Клубника Малиновка"), "strawberry");

    const hedgehog = getTagVisual("kids-auto", 0, "Кабачок");
    assert.equal(hedgehog.kidsCharacter, "hedgehog");
    assert.equal(hedgehog.uppercase, true);

    const sunflower = getTagVisual("kids-auto", 0, "Подсолнух");
    assert.equal(sunflower.kidsCharacter, "sunflower");

    const wateringCan = getTagVisual("provence-auto", 0, "Душица");
    assert.equal(wateringCan.provencePlaque, "watering-can");

    const mintHeart = getTagVisual("provence-auto", 0, "Мята");
    assert.equal(mintHeart.provencePlaque, "heart");

    const collectionKits = presets.filter(
      (kit) => kit.category === "collections",
    );
    assert.equal(collectionKits.length, 3);
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
