import type { orders } from "@acme/db";
import { db, user } from "@acme/db";
import { sendEmailHtml } from "@acme/emails";
import { eq } from "drizzle-orm";
import { smsProvider } from "./auth";

type Order = typeof orders.$inferSelect;
const messages: Record<Order["status"], string> = {
  pending_payment: "ожидает оплаты",
  paid: "оплачен",
  generating_stl: "готовится к печати",
  printing: "печатается",
  shipped_ozon: "передан в Ozon",
  ready_for_pickup: "ждёт вас в пункте Ozon",
  completed: "завершён",
  cancelled: "отменён",
};

export async function notifyOrderStatus(order: Order) {
  const text = `CraftSad: заказ ${order.orderNumber} ${messages[order.status]}.${order.ozonTrackingNumber ? ` Трек-номер Ozon: ${order.ozonTrackingNumber}.` : ""}`;
  const [customer] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, order.userId));
  const email = customer?.email;
  const actions: Promise<unknown>[] = [
    smsProvider.send(order.customerPhone, text),
  ];
  if (email && !email.endsWith("@phone.craftsad.invalid"))
    actions.push(
      sendEmailHtml({
        to: [email],
        subject: `Заказ ${order.orderNumber} — CraftSad`,
        html: `<p>${text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char)}</p>`,
      }),
    );
  const results = await Promise.allSettled(actions);
  for (const result of results)
    if (result.status === "rejected")
      console.error("Уведомление не отправлено", result.reason);
}
