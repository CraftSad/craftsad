import { cartSchema, priceCart } from "@acme/store/pricing";
import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../../orpc";

export const calculate = publicProcedure.input(cartSchema).handler(async ({ context, input }) => {
  try { return await priceCart(context.db, input); }
  catch (error) { throw new ORPCError("BAD_REQUEST", { message: (error as Error).message }); }
});
