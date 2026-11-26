import { expect, test } from "bun:test";
import type { Database } from "@acme/db";
import { detectScadMotif, layoutText, resolveScadTemplate } from "./model";
import { cartSchema, itemTotal, priceCart } from "./pricing";

test("price counts each variety in each set", () => {
  expect(itemTotal(7900, 2, 3)).toBe(47400);
});

test("long Cyrillic variety fits on two lines", () => {
  const layout = layoutText("Томат Бычье сердце розовое", 100, 25);
  expect(layout.lines).toHaveLength(2);
  expect(layout.fontSize).toBeGreaterThanOrEqual(3);
});

test("unprintable long word is rejected before spawning OpenSCAD", () => {
  expect(() => layoutText("А".repeat(80), 80, 15)).toThrow();
});

test("rejects empty or oversized variety names", () => {
  const base = {
    productId: crypto.randomUUID(),
    quantity: 1,
    customization: {
      shape: "rounded",
      lengthMm: 100,
      heightMm: 25,
      baseColor: "зелёный",
      textColor: "белый",
      varieties: [""],
    },
  };
  expect(cartSchema.safeParse({ items: [base] }).success).toBe(false);
  expect(
    cartSchema.safeParse({
      items: [
        {
          ...base,
          customization: { ...base.customization, varieties: ["А".repeat(81)] },
        },
      ],
    }).success,
  ).toBe(false);
});

test("accepts themed series customizations and resolves OpenSCAD templates", () => {
  expect(resolveScadTemplate("slate")).toBe("tag_slate.scad");
  expect(resolveScadTemplate("kids")).toBe("tag_kids.scad");
  expect(resolveScadTemplate("provence")).toBe("tag_provence.scad");
  expect(resolveScadTemplate(undefined)).toBe("tag.scad");
  expect(detectScadMotif("Клубника Елизавета")).toBe("strawberry");
  expect(detectScadMotif("Розмарин")).toBe("rosemary");

  const parsed = cartSchema.safeParse({
    items: [
      {
        productId: crypto.randomUUID(),
        quantity: 1,
        customization: {
          series: "kids",
          shape: "figurine",
          lengthMm: 80,
          heightMm: 56,
          baseColor: "морковный",
          textColor: "белый",
          accentColor: "оливковый",
          varieties: ["Морковь", "Клубника", "Кабачок"],
        },
      },
    ],
  });
  expect(parsed.success).toBe(true);
});

test("pricing persists the catalog series for generation, including legacy requests", async () => {
  const product = {
    id: crypto.randomUUID(),
    series: "kids",
    priceKopecks: 14500,
    isCustomizable: true,
  };
  const database = {
    select: () => ({ from: () => ({ where: async () => [product] }) }),
  } as unknown as Database;
  for (const series of ["classic", undefined]) {
    const cart = cartSchema.parse({
      items: [
        {
          productId: product.id,
          quantity: 2,
          customization: {
            series,
            shape: "figurine",
            lengthMm: 80,
            heightMm: 56,
            baseColor: "морковный",
            textColor: "белый",
            varieties: ["Морковь"],
          },
        },
      ],
    });
    const priced = await priceCart(database, cart);
    expect(priced.totalAmount).toBe(29000);
    expect(priced.items[0]?.customizationJson?.series).toBe("kids");
  }
});
