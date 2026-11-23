import { desc, eq, orders, savedVarietyLists } from "@acme/db";
import { protectedProcedure } from "../../orpc";

const labels: Record<string, string> = {
  pending_payment: "Ожидает оплаты", paid: "Оплачен", generating_stl: "Готовим модели",
  printing: "Печатаем", shipped_ozon: "Передан в Ozon", ready_for_pickup: "Можно забрать в пункте Ozon",
  completed: "Получен", cancelled: "Отменён",
};

export const meOrders = protectedProcedure.handler(async ({ context }) => {
  const rows = await context.db.select().from(orders).where(eq(orders.userId, context.session.user.id)).orderBy(desc(orders.createdAt));
  return rows.map((row) => ({ ...row, statusLabel: labels[row.status] }));
});

export const meVarieties = protectedProcedure.handler(({ context }) =>
  context.db.select().from(savedVarietyLists).where(eq(savedVarietyLists.userId, context.session.user.id)).orderBy(desc(savedVarietyLists.createdAt))
);
