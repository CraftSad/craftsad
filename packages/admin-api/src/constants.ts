import { z } from "zod";

/** Order lifecycle, mirrored from `orderStatus` in `@acme/db`. */
export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "generating_stl",
  "printing",
  "shipped_ozon",
  "ready_for_pickup",
  "completed",
  "cancelled",
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export type OrderStatus = (typeof ORDER_STATUSES)[number];
