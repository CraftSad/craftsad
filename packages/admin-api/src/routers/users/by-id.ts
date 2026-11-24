import { desc, eq, orderItems, orders, sql, user } from "@acme/db";
import { z } from "zod";

import { adminProcedure } from "../../orpc";

/**
 * A single user with their order history and lifetime totals.
 *
 * Throws NOT_FOUND when no user matches the given id.
 */
export const byId = adminProcedure
  .errors({ NOT_FOUND: { message: "Пользователь не найден" } })
  .input(z.object({ id: z.string().min(1) }))
  .handler(async ({ context, input, errors }) => {
    const found = await context.db.query.user.findFirst({
      where: eq(user.id, input.id),
    });

    if (!found) {
      throw errors.NOT_FOUND();
    }

    const userOrders = await context.db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        totalAmount: orders.totalAmount,
        ozonCity: orders.ozonCity,
        createdAt: orders.createdAt,
        itemCount: sql<number>`(select count(*)::int from ${orderItems} where ${orderItems.orderId} = ${orders.id})`,
      })
      .from(orders)
      .where(eq(orders.userId, found.id))
      .orderBy(desc(orders.createdAt));

    const totalSpent = userOrders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      user: found,
      orders: userOrders,
      stats: {
        orderCount: userOrders.length,
        totalSpent,
      },
    };
  });
