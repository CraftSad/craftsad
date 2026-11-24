import { eq, orders } from "@acme/db";
import { z } from "zod";

import { adminProcedure } from "../../orpc";

/**
 * Full order: customer, line items (with products) and print job.
 *
 * Throws NOT_FOUND when no order matches the given id.
 */
export const byId = adminProcedure
  .errors({ NOT_FOUND: { message: "Заказ не найден" } })
  .input(z.object({ id: z.string().min(1) }))
  .handler(async ({ context, input, errors }) => {
    const found = await context.db.query.orders.findFirst({
      where: eq(orders.id, input.id),
      with: {
        user: true,
        items: {
          with: {
            product: true,
          },
        },
        printJob: true,
      },
    });

    if (!found) {
      throw errors.NOT_FOUND();
    }

    return found;
  });
