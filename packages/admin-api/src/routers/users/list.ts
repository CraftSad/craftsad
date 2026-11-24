import { desc, eq, ilike, or, orders, sql, user } from "@acme/db";
import { z } from "zod";

import { adminProcedure } from "../../orpc";

/**
 * Paginated user directory with per-user order totals.
 *
 * @example client.users.list({ limit: 20, offset: 0, query: "anna" })
 */
export const list = adminProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      query: z.string().trim().optional(),
    }),
  )
  .handler(async ({ context, input }) => {
    const search = input.query?.trim();
    const pattern = search ? `%${search}%` : undefined;
    const where = pattern
      ? or(
          ilike(user.name, pattern),
          ilike(user.email, pattern),
          ilike(user.phoneNumber, pattern),
        )
      : undefined;

    const orderStats = context.db
      .select({
        userId: orders.userId,
        orderCount: sql<number>`count(*)::int`.as("order_count"),
        totalSpent:
          sql<number>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.status} <> 'cancelled'), 0)::int`.as(
            "total_spent",
          ),
        lastOrderAt: sql<Date | null>`max(${orders.createdAt})`.as(
          "last_order_at",
        ),
      })
      .from(orders)
      .groupBy(orders.userId)
      .as("order_stats");

    const [rows, totalRow] = await Promise.all([
      context.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          phoneNumberVerified: user.phoneNumberVerified,
          role: user.role,
          banned: user.banned,
          createdAt: user.createdAt,
          orderCount: sql<number>`coalesce(${orderStats.orderCount}, 0)::int`,
          totalSpent: sql<number>`coalesce(${orderStats.totalSpent}, 0)::int`,
          lastOrderAt: orderStats.lastOrderAt,
        })
        .from(user)
        .leftJoin(orderStats, eq(orderStats.userId, user.id))
        .where(where)
        .orderBy(desc(user.createdAt))
        .limit(input.limit)
        .offset(input.offset),
      context.db
        .select({ count: sql<number>`count(*)::int` })
        .from(user)
        .where(where),
    ]);

    return {
      items: rows,
      total: totalRow[0]?.count ?? 0,
      limit: input.limit,
      offset: input.offset,
    };
  });
