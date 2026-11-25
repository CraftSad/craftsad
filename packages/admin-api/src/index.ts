import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";

import type { AdminAppRouter } from "./routers";

/**
 * Inference helpers for input types.
 *
 * @example
 *   type OrderListInput = RouterInputs['orders']['list']
 */
type RouterInputs = InferRouterInputs<AdminAppRouter>;

/**
 * Inference helpers for output types.
 *
 * @example
 *   type OrderListOutput = RouterOutputs['orders']['list']
 */
type RouterOutputs = InferRouterOutputs<AdminAppRouter>;

export {
  ORDER_STATUSES,
  type OrderStatus,
  orderStatusSchema,
} from "./constants";
export { createAdminORPCContext } from "./orpc";
export {
  type AdminAppRouter,
  adminRouter,
} from "./routers";
export type { RouterInputs, RouterOutputs };
