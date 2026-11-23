import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth/user";

export const orderStatus = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "generating_stl",
  "printing",
  "shipped_ozon",
  "ready_for_pickup",
  "completed",
  "cancelled",
]);
export const printJobStatus = pgEnum("print_job_status", [
  "queued",
  "processing",
  "done",
  "failed",
]);
export const orderNumberSequence = pgSequence("craftsad_order_number_seq", {
  startWith: 1001,
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    priceKopecks: integer("price_kopecks").notNull(),
    isCustomizable: boolean("is_customizable").notNull().default(false),
    scadTemplate: text("scad_template"),
    active: boolean("active").notNull().default(true),
  },
  (t) => [check("products_price_positive", sql`${t.priceKopecks} >= 0`)],
);

export const savedVarietyLists = pgTable(
  "saved_variety_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    name: varchar("name", { length: 160 }).notNull(),
    varieties: jsonb("varieties").$type<string[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("saved_varieties_user_idx").on(t.userId)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    status: orderStatus("status").notNull().default("pending_payment"),
    totalAmount: integer("total_amount").notNull(),
    ozonCity: text("ozon_city").notNull(),
    ozonPvzAddress: text("ozon_pvz_address").notNull(),
    ozonPvzId: text("ozon_pvz_id").notNull(),
    ozonTrackingNumber: text("ozon_tracking_number"),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status, t.createdAt),
    check("orders_amount_positive", sql`${t.totalAmount} >= 0`),
  ],
);

export type TagCustomization = {
  shape: "rounded" | "rectangular";
  lengthMm: number;
  heightMm: number;
  baseColor: string;
  textColor: string;
  varieties: string[];
};
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    customizationJson: jsonb("customization_json").$type<TagCustomization>(),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
  ],
);

export const printJobs = pgTable(
  "print_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .unique()
      .references(() => orders.id),
    status: printJobStatus("status").notNull().default("queued"),
    stlArchiveUrl: text("stl_archive_url"),
    errorLog: text("error_log"),
    attempts: integer("attempts").notNull().default(0),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("print_jobs_queue_idx").on(t.status, t.createdAt)],
);

export const orderRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  printJob: one(printJobs),
  user: one(user, { fields: [orders.userId], references: [user.id] }),
}));
export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
export const printJobRelations = relations(printJobs, ({ one }) => ({
  order: one(orders, { fields: [printJobs.orderId], references: [orders.id] }),
}));

export const otpSendLimits = pgTable("otp_send_limits", {
  identifier: text("identifier").primaryKey(),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }).notNull(),
});
