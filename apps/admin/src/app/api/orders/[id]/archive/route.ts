import { isAdmin } from "@acme/auth/roles";
import { db, eq, orders, printJobs } from "@acme/db";
import { readArchive } from "@acme/store/storage";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "~/auth/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdmin(session.user))
    return new Response("Доступ запрещён", { status: 403 });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new Response("Неверный номер заказа", { status: 400 });
  const [row] = await db
    .select({ number: orders.orderNumber, url: printJobs.stlArchiveUrl })
    .from(orders)
    .innerJoin(printJobs, eq(printJobs.orderId, orders.id))
    .where(eq(orders.id, id));
  if (!row?.url) return new Response("Архив ещё не готов", { status: 404 });
  const bytes = await readArchive(row.url);
  return new Response(new Blob([new Uint8Array(bytes)]), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="order-${row.number}-models.zip"`,
    },
  });
}
