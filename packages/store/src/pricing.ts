import { type Database, products } from "@acme/db";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { layoutText } from "./layout";

export const seriesSchema = z.enum(["classic", "slate", "kids", "provence"]);

export const customizationSchema = z.object({
  // Accepted for older clients; the catalog determines the order series.
  series: seriesSchema.optional(),
  shape: z.enum([
    "rounded",
    "rectangular",
    "contour",
    "cloud",
    "figurine",
    "hedgehog",
    "sunflower",
    "plaque",
    "watering_can",
  ]),
  lengthMm: z.number().int().min(60).max(200),
  heightMm: z.number().int().min(15).max(100),
  baseColor: z.string().min(1).max(40),
  textColor: z.string().min(1).max(40),
  accentColor: z.string().min(1).max(40).optional(),
  varieties: z.array(z.string().trim().min(1).max(80)).min(1).max(100),
});

export const cartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().min(1).max(100),
        customization: customizationSchema.optional(),
      }),
    )
    .min(1)
    .max(30),
});

export type Cart = z.infer<typeof cartSchema>;
export function itemTotal(
  priceKopecks: number,
  quantity: number,
  varieties: number,
) {
  return priceKopecks * quantity * varieties;
}

export const orderSchema = cartSchema.extend({
  ozonCity: z.string().trim().min(2).max(160),
  ozonPvzAddress: z.string().trim().min(5).max(300),
  ozonPvzId: z.string().trim().min(2).max(100),
  customerName: z.string().trim().min(2).max(160),
  customerPhone: z.string().regex(/^\+7\d{10}$/),
  varietyListName: z.string().trim().min(1).max(160).optional(),
});

export async function priceCart(database: Database, cart: Cart) {
  const ids = [...new Set(cart.items.map((item) => item.productId))];
  const rows = await database
    .select()
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.active, true)));
  const byId = new Map(rows.map((row) => [row.id, row]));
  let totalAmount = 0;
  let modelCount = 0;
  const items = cart.items.map((item) => {
    const product = byId.get(item.productId.toLowerCase());
    if (!product) throw new Error("Товар не найден или недоступен");
    if (product.isCustomizable !== !!item.customization)
      throw new Error("Неверные параметры товара");
    const count = item.customization?.varieties.length ?? 1;
    if (item.customization) {
      modelCount += item.quantity * count;
      for (const variety of item.customization.varieties)
        layoutText(
          variety,
          item.customization.lengthMm,
          item.customization.heightMm,
        );
    }
    const lineTotal = itemTotal(product.priceKopecks, item.quantity, count);
    totalAmount += lineTotal;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.priceKopecks,
      customizationJson: item.customization
        ? { ...item.customization, series: product.series }
        : null,
      lineTotal,
    };
  });
  if (totalAmount > 100_000_000) throw new Error("Сумма заказа слишком велика");
  if (modelCount > 500)
    throw new Error("В одном заказе можно заказать не более 500 бирок");
  return { totalAmount, items };
}
