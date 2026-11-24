import { adminOrdersRouter } from "./admin";
import { catalog } from "./catalog";
import { calculate } from "./constructor";
import { meOrders, meVarieties } from "./me";
import { createOrder } from "./orders";

export const storeRouter = {
  catalog,
  constructor: { calculate },
  orders: { create: createOrder },
  me: { orders: meOrders, varieties: meVarieties },
  admin: { orders: adminOrdersRouter },
};
