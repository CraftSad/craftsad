import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { db, orderItems, orders, printJobs, products } from "@acme/db";
import { and, eq, sql } from "drizzle-orm";
import { zipSync } from "fflate";
import { generateStl } from "./model";
import { storeArchive } from "./storage";
import { stlTo3mf } from "./three-mf";

async function claim() {
  const result =
    (await db.execute(sql`update print_jobs set status = 'processing', locked_at = now(), attempts = attempts + 1
    where id = (select j.id from print_jobs j join orders o on o.id = j.order_id
      where o.status in ('paid', 'generating_stl') and (j.status = 'queued' or (j.status = 'processing' and j.locked_at < now() - interval '5 minutes'))
      order by j.created_at for update of j skip locked limit 1)
    returning id, order_id`)) as { rows: { id: string; order_id: string }[] };
  return result.rows[0] as { id: string; order_id: string } | undefined;
}

async function processJob(job: { id: string; order_id: string }) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, job.order_id));
  if (!order?.orderNumber) throw new Error("Заказ не найден");
  await db
    .update(orders)
    .set({ status: "generating_stl" })
    .where(eq(orders.id, order.id));
  const items = await db
    .select({ item: orderItems, template: products.scadTemplate })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orderItems.orderId, order.id));
  const temp = await mkdtemp(join(tmpdir(), "3dbirka-"));
  const heartbeat = setInterval(() => {
    void db
      .update(printJobs)
      .set({ lockedAt: new Date() })
      .where(eq(printJobs.id, job.id));
  }, 30_000);
  try {
    const entries: Record<string, Uint8Array> = {};
    let index = 0;
    for (const { item, template } of items) {
      if (!item.customizationJson) continue;
      for (let copy = 0; copy < item.quantity; copy++)
        for (const variety of item.customizationJson.varieties) {
          index++;
          const filename = `${String(index).padStart(3, "0")}-${variety.replace(/[^\p{L}\p{N}-]+/gu, "_").slice(0, 50)}.stl`;
          const path = join(temp, filename);
          await generateStl(
            item.customizationJson,
            variety,
            path,
            template ?? "tag.scad",
          );
          const stl = new Uint8Array(await readFile(path));
          entries[filename] = stl;
          entries[filename.replace(/\.stl$/, ".3mf")] = stlTo3mf(stl, {
            name: variety,
            baseColor: item.customizationJson.baseColor,
            textColor: item.customizationJson.textColor,
          });
        }
    }
    if (!index) throw new Error("В заказе нет бирок для генерации");
    const archive = zipSync(entries, { level: 6 });
    const url = await storeArchive(`order-${order.orderNumber}.zip`, archive);
    await db
      .update(printJobs)
      .set({
        status: "done",
        stlArchiveUrl: url,
        errorLog: null,
        lockedAt: null,
      })
      .where(eq(printJobs.id, job.id));
    await db
      .update(orders)
      .set({ status: "printing" })
      .where(and(eq(orders.id, order.id), eq(orders.status, "generating_stl")));
  } finally {
    clearInterval(heartbeat);
    await rm(temp, { recursive: true, force: true });
  }
}

for (;;) {
  const job = await claim();
  if (!job) {
    await Bun.sleep(3000);
    continue;
  }
  try {
    await processJob(job);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Ошибка генерации STL", job.id, message);
    await db
      .update(printJobs)
      .set({
        status: "failed",
        errorLog: message.slice(0, 8000),
        lockedAt: null,
      })
      .where(eq(printJobs.id, job.id));
  }
}
