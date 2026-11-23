import {
  categories,
  db,
  orderItems,
  orders,
  otpSendLimits,
  printJobs,
  products,
  savedVarietyLists,
} from "@acme/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { auth } from "./auth";
import { layoutText } from "./model";
import { notifyOrderStatus } from "./notifications";
import { type Cart, cartSchema, itemTotal, orderSchema } from "./pricing";
import { readArchive } from "./storage";

const app = new Hono();
app.use(
  "/*",
  cors({
    origin: process.env.APP_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);

// An atomic DB gate covers both email and phone sends across all API instances.
app.use("/api/auth/*", async (c, next) => {
  if (c.req.method !== "POST") return next();
  const path = new URL(c.req.url).pathname;
  if (
    !path.endsWith("/email-otp/send-verification-otp") &&
    !path.endsWith("/phone-number/send-otp")
  )
    return next();
  const body = (await c.req.raw
    .clone()
    .json()
    .catch(() => ({}))) as Record<string, unknown>;
  const identifier = path.includes("email-otp") ? body.email : body.phoneNumber;
  if (typeof identifier !== "string" || identifier.length > 254)
    return c.json({ error: "Укажите почту или телефон" }, 400);
  const key = `${path.includes("email-otp") ? "email" : "phone"}:${identifier.trim().toLowerCase()}`;
  const result = await db
    .insert(otpSendLimits)
    .values({ identifier: key, lastSentAt: new Date() })
    .onConflictDoUpdate({
      target: otpSendLimits.identifier,
      set: { lastSentAt: new Date() },
      setWhere: sql`${otpSendLimits.lastSentAt} <= now() - interval '60 seconds'`,
    })
    .returning({ identifier: otpSendLimits.identifier });
  if (!result.length)
    return c.json(
      { error: "Пожалуйста, подождите 60 секунд перед запросом нового кода" },
      429,
    );
  return next();
});
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

async function currentUser(c: { req: { raw: Request } }) {
  return (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
}

async function pricedItems(cart: Cart) {
  const ids = [...new Set(cart.items.map((item) => item.productId))];
  const rows = await db
    .select()
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.active, true)));
  const byId = new Map(rows.map((row) => [row.id, row]));
  let totalAmount = 0;
  let modelCount = 0;
  const items = cart.items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) throw new Error("Товар не найден или недоступен");
    if (product.isCustomizable !== !!item.customization)
      throw new Error("Неверные параметры товара");
    const count = item.customization?.varieties.length ?? 1;
    if (item.customization) {
      modelCount += item.quantity * count;
      for (const variety of item.customization.varieties)
        layoutText(
          variety,
          item.customization.lengthMm,
          item.customization.heightMm,
        );
    }
    const lineTotal = itemTotal(product.priceKopecks, item.quantity, count);
    totalAmount += lineTotal;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.priceKopecks,
      customizationJson: item.customization ?? null,
      lineTotal,
    };
  });
  if (totalAmount > 100_000_000) throw new Error("Сумма заказа слишком велика");
  if (modelCount > 500)
    throw new Error("В одном заказе можно заказать не более 500 бирок");
  return { totalAmount, items };
}

app.get("/api/catalog", async (c) =>
  c.json({
    categories: await db
      .select()
      .from(categories)
      .orderBy(categories.sortOrder),
    products: await db.select().from(products).where(eq(products.active, true)),
  }),
);

app.post("/api/constructor/calculate", async (c) => {
  const input = cartSchema.safeParse(await c.req.json().catch(() => null));
  if (!input.success)
    return c.json(
      { error: "Проверьте параметры набора", details: input.error.issues },
      400,
    );
  try {
    return c.json(await pricedItems(input.data));
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.post("/api/orders", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "Войдите по коду" }, 401);
  const input = orderSchema.safeParse(await c.req.json().catch(() => null));
  if (!input.success)
    return c.json(
      { error: "Проверьте данные заказа", details: input.error.issues },
      400,
    );
  try {
    const priced = await pricedItems(input.data);
    const created = await db.transaction(async (tx) => {
      const seq = (await tx.execute(
        sql`select nextval('craftsad_order_number_seq') as number`,
      )) as { rows: { number: string }[] };
      const number = `CS-${String(seq.rows[0]?.number)}`;
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: number,
          userId: user.id,
          totalAmount: priced.totalAmount,
          ozonCity: input.data.ozonCity,
          ozonPvzAddress: input.data.ozonPvzAddress,
          ozonPvzId: input.data.ozonPvzId,
          customerName: input.data.customerName,
          customerPhone: input.data.customerPhone,
        })
        .returning();
      if (!order) throw new Error("Не удалось создать заказ");
      await tx.insert(orderItems).values(
        priced.items.map(({ lineTotal: _, ...item }) => ({
          ...item,
          orderId: order.id,
        })),
      );
      const varieties = priced.items.flatMap(
        (item) => item.customizationJson?.varieties ?? [],
      );
      if (varieties.length)
        await tx.insert(savedVarietyLists).values({
          userId: user.id,
          name: input.data.varietyListName ?? number,
          varieties,
        });
      return order;
    });
    return c.json({ order: created }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

app.get("/api/me/orders", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "Войдите по коду" }, 401);
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));
  const labels: Record<string, string> = {
    pending_payment: "Ожидает оплаты",
    paid: "Оплачен",
    generating_stl: "Готовим модели",
    printing: "Печатаем",
    shipped_ozon: "Передан в Ozon",
    ready_for_pickup: "Можно забрать в пункте Ozon",
    completed: "Получен",
    cancelled: "Отменён",
  };
  return c.json(
    rows.map((row) => ({ ...row, statusLabel: labels[row.status] })),
  );
});

app.get("/api/me/varieties", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "Войдите по коду" }, 401);
  return c.json(
    await db
      .select()
      .from(savedVarietyLists)
      .where(eq(savedVarietyLists.userId, user.id))
      .orderBy(desc(savedVarietyLists.createdAt)),
  );
});

async function adminUser(c: { req: { raw: Request } }) {
  const user = await currentUser(c);
  return user?.role === "admin" ? user : null;
}

app.get("/api/admin/orders", async (c) => {
  if (!(await adminUser(c))) return c.json({ error: "Доступ запрещён" }, 403);
  const rows = await db
    .select({ order: orders, printJob: printJobs })
    .from(orders)
    .leftJoin(printJobs, eq(printJobs.orderId, orders.id))
    .where(
      inArray(orders.status, [
        "paid",
        "generating_stl",
        "printing",
        "shipped_ozon",
        "ready_for_pickup",
      ]),
    )
    .orderBy(orders.createdAt);
  return c.json(
    rows.map((row) => ({
      ...row,
      archiveDownloadUrl: row.printJob?.stlArchiveUrl
        ? `/api/admin/orders/${row.order.id}/archive`
        : null,
    })),
  );
});

app.get("/api/admin/orders/:id/archive", async (c) => {
  if (!(await adminUser(c))) return c.json({ error: "Доступ запрещён" }, 403);
  if (!z.uuid().safeParse(c.req.param("id")).success)
    return c.json({ error: "Неверный номер заказа" }, 400);
  const [row] = await db
    .select({ number: orders.orderNumber, url: printJobs.stlArchiveUrl })
    .from(orders)
    .innerJoin(printJobs, eq(printJobs.orderId, orders.id))
    .where(eq(orders.id, c.req.param("id")));
  if (!row?.url) return c.json({ error: "Архив ещё не готов" }, 404);
  const bytes = await readArchive(row.url);
  return new Response(bytes, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="order-${row.number}.zip"`,
    },
  });
});

app.patch("/api/admin/orders/:id/status", async (c) => {
  if (!(await adminUser(c))) return c.json({ error: "Доступ запрещён" }, 403);
  if (!z.uuid().safeParse(c.req.param("id")).success)
    return c.json({ error: "Неверный номер заказа" }, 400);
  const input = z
    .object({
      status: z.enum([
        "pending_payment",
        "paid",
        "generating_stl",
        "printing",
        "shipped_ozon",
        "ready_for_pickup",
        "completed",
        "cancelled",
      ]),
      ozonTrackingNumber: z.string().trim().min(3).max(100).optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!input.success)
    return c.json({ error: "Неверный статус или трек-номер" }, 400);
  const [old] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, c.req.param("id")));
  if (!old) return c.json({ error: "Заказ не найден" }, 404);
  if (
    input.data.status === "shipped_ozon" &&
    !(input.data.ozonTrackingNumber ?? old.ozonTrackingNumber)
  )
    return c.json({ error: "Укажите трек-номер Ozon" }, 400);
  const [updated] = await db.transaction(async (tx) => {
    const changed = await tx
      .update(orders)
      .set({
        status: input.data.status,
        ...(input.data.ozonTrackingNumber
          ? { ozonTrackingNumber: input.data.ozonTrackingNumber }
          : {}),
      })
      .where(eq(orders.id, old.id))
      .returning();
    if (input.data.status === "paid") {
      const customizable = await tx
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(
          and(
            eq(orderItems.orderId, old.id),
            sql`${orderItems.customizationJson} is not null`,
          ),
        )
        .limit(1);
      if (customizable.length)
        await tx
          .insert(printJobs)
          .values({ orderId: old.id })
          .onConflictDoUpdate({
            target: printJobs.orderId,
            set: { status: "queued", errorLog: null },
            setWhere: eq(printJobs.status, "failed"),
          });
    }
    return changed;
  });
  if (
    updated &&
    (old.status !== updated.status ||
      old.ozonTrackingNumber !== updated.ozonTrackingNumber)
  )
    await notifyOrderStatus(updated);
  return c.json(updated);
});

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Внутренняя ошибка сервера" }, 500);
});
export default {
  port: Number(process.env.STORE_API_PORT ?? 7000),
  fetch: app.fetch,
};
export { app };
