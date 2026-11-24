import { categories, db, products } from "@acme/db";

const [category] = await db
  .insert(categories)
  .values({ slug: "garden-tags", name: "Именные садовые бирки" })
  .onConflictDoUpdate({
    target: categories.slug,
    set: { name: "Именные садовые бирки" },
  })
  .returning();
if (!category) throw new Error("Не удалось создать категорию");
await db
  .insert(products)
  .values({
    categoryId: category.id,
    slug: "personalized-garden-tag",
    name: "Именная бирка для рассады",
    description: "Бирка с рельефным названием сорта. Цена за одну бирку.",
    priceKopecks: 7900,
    isCustomizable: true,
    scadTemplate: "tag.scad",
  })
  .onConflictDoUpdate({
    target: products.slug,
    set: {
      categoryId: category.id,
      name: "Именная бирка для рассады",
      isCustomizable: true,
      scadTemplate: "tag.scad",
    },
  });
console.log("Каталог 3dbirka готов");
