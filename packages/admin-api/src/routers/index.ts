/**
 * Root router for the admin API.
 *
 *   users.list          – paginated customer directory with order totals
 *   users.byId          – one customer and their order history
 *   orders.list         – paginated order feed (filter + search)
 *   orders.byId         – one order with items, customer and print job
 *   orders.updateStatus – move an order through its lifecycle
 *   stats.overview      – dashboard counters
 *
 * Every procedure is admin-only.
 */

import { adminOrdersRouter } from "./orders";
import { adminStatsRouter } from "./stats";
import { adminUsersRouter } from "./users";

export const adminRouter = {
  users: adminUsersRouter,
  orders: adminOrdersRouter,
  stats: adminStatsRouter,
};

export type AdminAppRouter = typeof adminRouter;
