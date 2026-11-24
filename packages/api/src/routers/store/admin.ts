import { and, eq, inArray, orderItems, orders, printJobs, sql } from "@acme/db";
import { notifyOrderStatus } from "@acme/store/notifications";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { adminProcedure } from "../../orpc";

const status = z.enum([
  "pending_payment",
  "paid",
  "generating_stl",
  "printing",
  "shipped_ozon",
  "ready_for_pickup",
  "completed",
  "cancelled",
]);

const list = adminProcedure.handler(async ({ context }) => {
  const rows = await context.db
    .select({ order: orders, printJob: printJobs })
    .from(orders)
    .leftJoin(printJobs, eq(printJobs.orderId, orders.id))
    .where(
      inArray(orders.status, [
        "pending_payment",
        "paid",
        "generating_stl",
        "printing",
        "shipped_ozon",
        "ready_for_pickup",
      ]),
    )
    .orderBy(orders.createdAt);
  return rows.map((row) => ({
    ...row,
    archiveDownloadUrl: row.printJob?.stlArchiveUrl
      ? `/api/admin/orders/${row.order.id}/archive`
      : null,
  }));
});

const updateStatus = adminProcedure
  .input(
    z.object({
      id: z.uuid(),
      status,
      ozonTrackingNumber: z.string().trim().min(3).max(100).optional(),
    }),
  )
  .handler(async ({ context, input }) => {
    const [old] = await context.db
      .select()
      .from(orders)
      .where(eq(orders.id, input.id));
    if (!old) throw new ORPCError("NOT_FOUND", { message: "Заказ не найден" });
    if (
      input.status === "shipped_ozon" &&
      !(input.ozonTrackingNumber ?? old.ozonTrackingNumber)
    )
      throw new ORPCError("BAD_REQUEST", {
        message: "Укажите трек-номер Ozon",
      });
    const [updated] = await context.db.transaction(async (tx) => {
      const changed = await tx
        .update(orders)
        .set({
          status: input.status,
          ...(input.ozonTrackingNumber
            ? { ozonTrackingNumber: input.ozonTrackingNumber }
            : {}),
        })
        .where(eq(orders.id, old.id))
        .returning();
      if (input.status === "paid") {
        const customizable = await tx
          .select({ id: orderItems.id })
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderId, old.id),
              sql`${orderItems.customizationJson} is not null`,
            ),
          )
          .limit(1);
        if (customizable.length)
          await tx
            .insert(printJobs)
            .values({ orderId: old.id })
            .onConflictDoUpdate({
              target: printJobs.orderId,
              set: { status: "queued", errorLog: null },
              setWhere: eq(printJobs.status, "failed"),
            });
      }
      return changed;
    });
    if (
      updated &&
      (old.status !== updated.status ||
        old.ozonTrackingNumber !== updated.ozonTrackingNumber)
    )
      await notifyOrderStatus(updated, context.db);
    return updated;
  });

export const adminOrdersRouter = { list, updateStatus };
