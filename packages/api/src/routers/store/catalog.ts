import { categories, eq, products } from "@acme/db";
import { publicProcedure } from "../../orpc";

export const catalog = publicProcedure.handler(async ({ context }) => ({
  categories: await context.db
    .select()
    .from(categories)
    .orderBy(categories.sortOrder),
  products: await context.db
    .select()
    .from(products)
    .where(eq(products.active, true)),
}));
