import { categories, db, products } from "@acme/db";

const [classicCategory] = await db
  .insert(categories)
  .values({ slug: "garden-tags", name: "Именные садовые бирки", sortOrder: 1 })
  .onConflictDoUpdate({
    target: categories.slug,
    set: { name: "Именные садовые бирки", sortOrder: 1 },
  })
  .returning();

const [collectionsCategory] = await db
  .insert(categories)
  .values({
    slug: "author-collections",
    name: "Авторские коллекции табличек",
    sortOrder: 0,
  })
  .onConflictDoUpdate({
    target: categories.slug,
    set: { name: "Авторские коллекции табличек", sortOrder: 0 },
  })
  .returning();

if (!classicCategory || !collectionsCategory)
  throw new Error("Не удалось создать категории");

const catalogProducts = [
  {
    categoryId: classicCategory.id,
    slug: "personalized-garden-tag",
    name: "Именная бирка для рассады",
    description: "Бирка с рельефным названием сорта. Цена за одну бирку.",
    priceKopecks: 7900,
    isCustomizable: true,
    series: "classic" as const,
    scadTemplate: "tag.scad",
  },
  {
    categoryId: collectionsCategory.id,
    slug: "slate-collection-tag",
    name: "Грифельная коллекция — фигурная табличка",
    description:
      "Тёмная фигурная табличка со светлым кантом и ботаническим рельефом.",
    priceKopecks: 12000,
    isCustomizable: true,
    series: "slate" as const,
    scadTemplate: "tag_slate.scad",
  },
  {
    categoryId: collectionsCategory.id,
    slug: "kids-series-tag",
    name: "Детская серия — объёмная фигурка",
    description:
      "Многоцветная фигурная бирка в виде овоща, ягоды или лесного ёжика.",
    priceKopecks: 14500,
    isCustomizable: true,
    series: "kids" as const,
    scadTemplate: "tag_kids.scad",
  },
  {
    categoryId: collectionsCategory.id,
    slug: "provence-collection-tag",
    name: "Коллекция Прованс — резная табличка",
    description:
      "Французский картуш, сердечко или лейка с рельефной веточкой трав.",
    priceKopecks: 13500,
    isCustomizable: true,
    series: "provence" as const,
    scadTemplate: "tag_provence.scad",
  },
];

for (const entry of catalogProducts) {
  await db
    .insert(products)
    .values(entry)
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        categoryId: entry.categoryId,
        name: entry.name,
        description: entry.description,
        priceKopecks: entry.priceKopecks,
        isCustomizable: entry.isCustomizable,
        series: entry.series,
        scadTemplate: entry.scadTemplate,
      },
    });
}

console.log("Каталог 3D Бирка готов");
