import { z } from "zod";

export const customizationSchema = z.object({
  shape: z.enum(["rounded", "rectangular"]),
  lengthMm: z.number().int().min(80).max(200),
  heightMm: z.number().int().min(15).max(50),
  baseColor: z.string().min(1).max(40),
  textColor: z.string().min(1).max(40),
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
