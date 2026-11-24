import { inArray, orders, sql, user } from "@acme/db";

import { adminProcedure } from "../../orpc";

/** Orders still being worked on (everything before `completed`). */
const ACTIVE_STATUSES = [
  "pending_payment",
  "paid",
  "generating_stl",
  "printing",
  "shipped_ozon",
  "ready_for_pickup",
] as const;

/**
 * Headline numbers for the admin dashboard.
 *
 * @example client.stats.overview()
 */
export const overview = adminProcedure.handler(async ({ context }) => {
  const [userRow, orderRow, activeRow, byStatus] = await Promise.all([
    context.db.select({ count: sql<number>`count(*)::int` }).from(user),
    context.db
      .select({
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.status} <> 'cancelled'), 0)::int`,
      })
      .from(orders),
    context.db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(inArray(orders.status, ACTIVE_STATUSES)),
    context.db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status),
  ]);

  return {
    users: userRow[0]?.count ?? 0,
    orders: orderRow[0]?.count ?? 0,
    revenue: orderRow[0]?.revenue ?? 0,
    activeOrders: activeRow[0]?.count ?? 0,
    byStatus,
  };
});
