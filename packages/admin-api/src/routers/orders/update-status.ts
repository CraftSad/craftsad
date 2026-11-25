import { logger } from "@acme/config";
import { and, eq, orderItems, orders, printJobs, sql } from "@acme/db";
import { notifyOrderStatus } from "@acme/store/notifications";
import { z } from "zod";

import { orderStatusSchema } from "../../constants";
import { adminProcedure } from "../../orpc";

/**
 * Move an order through its lifecycle.
 *
 * A customizable order that becomes `paid` is queued for STL generation.
 * Customers are notified (SMS + email) when the status or tracking number
 * changes.
 */
export const updateStatus = adminProcedure
  .errors({
    NOT_FOUND: { message: "Заказ не найден" },
    BAD_REQUEST: { message: "Некорректные данные заказа" },
  })
  .input(
    z.object({
      id: z.uuid(),
      status: orderStatusSchema,
      ozonTrackingNumber: z.string().trim().min(3).max(100).optional(),
    }),
  )
  .handler(async ({ context, input, errors }) => {
    const [old] = await context.db
      .select()
      .from(orders)
      .where(eq(orders.id, input.id));

    if (!old) throw errors.NOT_FOUND();

    if (
      input.status === "shipped_ozon" &&
      !(input.ozonTrackingNumber ?? old.ozonTrackingNumber)
    ) {
      throw errors.BAD_REQUEST();
    }

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

        if (customizable.length) {
          await tx
            .insert(printJobs)
            .values({ orderId: old.id })
            .onConflictDoUpdate({
              target: printJobs.orderId,
              set: { status: "queued", errorLog: null },
              setWhere: eq(printJobs.status, "failed"),
            });
        }
      }

      return changed;
    });

    if (
      updated &&
      (old.status !== updated.status ||
        old.ozonTrackingNumber !== updated.ozonTrackingNumber)
    ) {
      try {
        await notifyOrderStatus(updated, context.db);
      } catch (error) {
        logger.error("admin_order.notification_failed", error, {
          orderId: updated.id,
        });
      }
    }

    return updated;
  });
