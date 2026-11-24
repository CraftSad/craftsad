import { orderItems, orders, savedVarietyLists, sql } from "@acme/db";
import { orderSchema, priceCart } from "@acme/store/pricing";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../../orpc";

export const createOrder = protectedProcedure.input(orderSchema).handler(async ({ context, input }) => {
  let priced: Awaited<ReturnType<typeof priceCart>>;
  try { priced = await priceCart(context.db, input); }
  catch (error) { throw new ORPCError("BAD_REQUEST", { message: (error as Error).message }); }
  const created = await context.db.transaction(async (tx) => {
    const seq = await tx.execute(sql`select nextval('craftsad_order_number_seq') as number`) as { rows: { number: string }[] };
    const number = `CS-${String(seq.rows[0]?.number)}`;
    const [order] = await tx.insert(orders).values({
      orderNumber: number, userId: context.session.user.id, totalAmount: priced.totalAmount,
      ozonCity: input.ozonCity, ozonPvzAddress: input.ozonPvzAddress, ozonPvzId: input.ozonPvzId,
      customerName: input.customerName, customerPhone: input.customerPhone,
    }).returning();
    if (!order) throw new Error("Не удалось создать заказ");
    await tx.insert(orderItems).values(priced.items.map(({ lineTotal: _, ...item }) => ({ ...item, orderId: order.id })));
    const varieties = priced.items.flatMap((item) => item.customizationJson?.varieties ?? []);
    if (varieties.length) await tx.insert(savedVarietyLists).values({ userId: context.session.user.id, name: input.varietyListName ?? number, varieties });
    return order;
  });
  return { order: created };
});
