import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { categories, orderItems, orders, products } from "@acme/db";
import { call, isDefinedError, ORPCError } from "@orpc/server";
import { ADMIN_EMAIL, createSession, setupTestApi } from "../../test/helpers";
import { adminRouter } from ".";

let api: Awaited<ReturnType<typeof setupTestApi>>;

beforeAll(async () => {
  api = await setupTestApi();
});
afterAll(() => api.close());

async function seedOrder(options: {
  userId: string;
  orderNumber: string;
  status?: "pending_payment" | "paid" | "printing" | "completed" | "cancelled";
  totalAmount?: number;
  customerName?: string;
  customerPhone?: string;
}) {
  const [category] = await api.db
    .insert(categories)
    .values({ slug: `cat-${crypto.randomUUID()}`, name: "Категория" })
    .returning();
  if (!category) throw new Error("category insert failed");

  const [product] = await api.db
    .insert(products)
    .values({
      categoryId: category.id,
      slug: `product-${crypto.randomUUID()}`,
      name: "Садовая бирка",
      priceKopecks: 50_000,
    })
    .returning();
  if (!product) throw new Error("product insert failed");

  const [order] = await api.db
    .insert(orders)
    .values({
      orderNumber: options.orderNumber,
      userId: options.userId,
      status: options.status ?? "pending_payment",
      totalAmount: options.totalAmount ?? 50_000,
      ozonCity: "Москва",
      ozonPvzAddress: "ул. Тверская, 1",
      ozonPvzId: "pvz-1",
      customerName: options.customerName ?? "Анна",
      customerPhone: options.customerPhone ?? "+79990000000",
    })
    .returning();
  if (!order) throw new Error("order insert failed");

  await api.db.insert(orderItems).values({
    orderId: order.id,
    productId: product.id,
    quantity: 1,
    unitPrice: 50_000,
  });

  return order;
}

describe("admin authorization", () => {
  it("rejects anonymous callers", async () => {
    const promise = call(
      adminRouter.users.list,
      { limit: 20, offset: 0 },
      { context: api.context() },
    );

    await expect(promise).rejects.toBeInstanceOf(ORPCError);
    await expect(promise).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(isDefinedError(await promise.catch((error) => error))).toBe(true);
  });

  it("forbids signed-in customers", async () => {
    const customer = await createSession(api.db);
    const promise = call(
      adminRouter.orders.list,
      { limit: 20, offset: 0, status: "all" },
      { context: api.context(customer) },
    );

    await expect(promise).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("accepts accounts with the admin role and ADMIN_EMAILS accounts", async () => {
    const byRole = await createSession(api.db, { role: "admin" });
    const byEmail = await createSession(api.db, { email: ADMIN_EMAIL });

    await expect(
      call(adminRouter.stats.overview, {}, { context: api.context(byRole) }),
    ).resolves.toBeDefined();
    await expect(
      call(adminRouter.stats.overview, {}, { context: api.context(byEmail) }),
    ).resolves.toBeDefined();
  });
});

describe("users.list", () => {
  it("returns customers with their order totals", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const customer = await createSession(api.db, {
      name: "Иван Петров",
      email: `ivan-${crypto.randomUUID()}@test.local`,
    });

    await seedOrder({
      userId: customer.user.id,
      orderNumber: `CS-${crypto.randomUUID()}`,
      totalAmount: 120_000,
      status: "completed",
    });
    await seedOrder({
      userId: customer.user.id,
      orderNumber: `CS-${crypto.randomUUID()}`,
      totalAmount: 30_000,
      status: "cancelled",
    });

    const result = await call(
      adminRouter.users.list,
      { limit: 50, offset: 0, query: "Иван" },
      { context: api.context(admin) },
    );

    expect(result.total).toBe(1);
    const row = result.items[0];
    expect(row?.name).toBe("Иван Петров");
    expect(row?.orderCount).toBe(2);
    // Cancelled orders are excluded from lifetime spend.
    expect(row?.totalSpent).toBe(120_000);
    expect(row?.lastOrderAt).toBeInstanceOf(Date);
  });
});

describe("users.byId", () => {
  it("returns the customer and their orders", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const customer = await createSession(api.db, { name: "Мария" });
    await seedOrder({
      userId: customer.user.id,
      orderNumber: `CS-${crypto.randomUUID()}`,
      status: "paid",
      totalAmount: 75_000,
    });

    const result = await call(
      adminRouter.users.byId,
      { id: customer.user.id },
      { context: api.context(admin) },
    );

    expect(result.user.name).toBe("Мария");
    expect(result.orders).toHaveLength(1);
    expect(result.stats.totalSpent).toBe(75_000);
  });

  it("throws NOT_FOUND for an unknown id", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const promise = call(
      adminRouter.users.byId,
      { id: crypto.randomUUID() },
      { context: api.context(admin) },
    );

    await expect(promise).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Пользователь не найден",
    });
    expect(isDefinedError(await promise.catch((error) => error))).toBe(true);
  });
});

describe("orders", () => {
  it("filters the feed by status and search", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const customer = await createSession(api.db, { name: "Олег" });
    const paid = await seedOrder({
      userId: customer.user.id,
      orderNumber: "CS-SEARCH-1",
      status: "paid",
      customerName: "Олег Иванов",
    });
    await seedOrder({
      userId: customer.user.id,
      orderNumber: "CS-SEARCH-2",
      status: "completed",
      customerName: "Олег Иванов",
    });

    const byStatus = await call(
      adminRouter.orders.list,
      { limit: 20, offset: 0, status: "paid", query: "SEARCH" },
      { context: api.context(admin) },
    );
    expect(byStatus.total).toBe(1);
    expect(byStatus.items[0]?.id).toBe(paid.id);
    expect(byStatus.items[0]?.user.id).toBe(customer.user.id);
    expect(byStatus.items[0]?.itemCount).toBe(1);
  });

  it("returns an order with items and customer", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const customer = await createSession(api.db, { name: "Светлана" });
    const order = await seedOrder({
      userId: customer.user.id,
      orderNumber: `CS-${crypto.randomUUID()}`,
      status: "printing",
    });

    const found = await call(
      adminRouter.orders.byId,
      { id: order.id },
      { context: api.context(admin) },
    );

    expect(found.orderNumber).toBe(order.orderNumber);
    expect(found.user.name).toBe("Светлана");
    expect(found.items).toHaveLength(1);
    expect(found.items[0]?.product.name).toBe("Садовая бирка");
    expect(found.printJob).toBeNull();
  });

  it("throws NOT_FOUND for an unknown order", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const promise = call(
      adminRouter.orders.byId,
      { id: crypto.randomUUID() },
      { context: api.context(admin) },
    );

    await expect(promise).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Заказ не найден",
    });
  });

  it("rejects a shipped order without a tracking number", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const customer = await createSession(api.db);
    const order = await seedOrder({
      userId: customer.user.id,
      orderNumber: `CS-${crypto.randomUUID()}`,
      status: "printing",
    });

    const promise = call(
      adminRouter.orders.updateStatus,
      { id: order.id, status: "shipped_ozon" },
      { context: api.context(admin) },
    );

    await expect(promise).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Некорректные данные заказа",
    });
  });
});

describe("stats.overview", () => {
  it("returns numeric totals beyond the PostgreSQL integer range", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const customer = await createSession(api.db);
    const options = { context: api.context(admin) };
    const before = await call(adminRouter.stats.overview, {}, options);

    for (const orderNumber of ["LARGE-1", "LARGE-2"]) {
      await seedOrder({
        userId: customer.user.id,
        orderNumber,
        totalAmount: 1_500_000_000,
      });
    }

    const result = await call(
      adminRouter.users.list,
      { limit: 1, offset: 0, query: customer.user.email },
      options,
    );
    const after = await call(adminRouter.stats.overview, {}, options);

    expect(result.items[0]?.totalSpent).toBe(3_000_000_000);
    expect(after.revenue - before.revenue).toBe(3_000_000_000);
  });

  it("counts users, orders and revenue", async () => {
    const admin = await createSession(api.db, { role: "admin" });
    const overview = await call(
      adminRouter.stats.overview,
      {},
      { context: api.context(admin) },
    );

    expect(overview.users).toBeGreaterThan(0);
    expect(overview.orders).toBeGreaterThan(0);
    expect(overview.revenue).toBeGreaterThan(0);
    expect(overview.byStatus.length).toBeGreaterThan(0);
  });
});
