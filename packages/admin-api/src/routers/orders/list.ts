import {
  and,
  desc,
  eq,
  ilike,
  or,
  orderItems,
  orders,
  sql,
  user,
} from "@acme/db";
import { z } from "zod";

import { orderStatusSchema } from "../../constants";
import { adminProcedure } from "../../orpc";

/**
 * Paginated order feed across every customer.
 *
 * Filter by lifecycle status and search by order number, customer name,
 * phone or account email.
 *
 * @example client.orders.list({ status: "paid", query: "CS-1001" })
 */
export const list = adminProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: orderStatusSchema.or(z.literal("all")).default("all"),
      query: z.string().trim().optional(),
    }),
  )
  .handler(async ({ context, input }) => {
    const search = input.query?.trim();
    const pattern = search ? `%${search}%` : undefined;

    const where = and(
      input.status === "all" ? undefined : eq(orders.status, input.status),
      pattern
        ? or(
            ilike(orders.orderNumber, pattern),
            ilike(orders.customerName, pattern),
            ilike(orders.customerPhone, pattern),
            ilike(user.email, pattern),
          )
        : undefined,
    );

    const [rows, totalRow] = await Promise.all([
      context.db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          totalAmount: orders.totalAmount,
          ozonCity: orders.ozonCity,
          customerName: orders.customerName,
          customerPhone: orders.customerPhone,
          createdAt: orders.createdAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          itemCount: sql<number>`(select count(*)::int from ${orderItems} where ${orderItems.orderId} = ${orders.id})`,
        })
        .from(orders)
        .innerJoin(user, eq(user.id, orders.userId))
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(input.offset),
      context.db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .innerJoin(user, eq(user.id, orders.userId))
        .where(where),
    ]);

    return {
      items: rows,
      total: totalRow[0]?.count ?? 0,
      limit: input.limit,
      offset: input.offset,
    };
  });
