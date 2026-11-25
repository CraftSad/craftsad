import { z } from "zod";

const subscription = z.object({
  email: z.email().max(254),
  consent: z.literal(true),
});

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json(
      { message: "Недопустимый источник запроса." },
      { status: 403 },
    );
  }
  if (Number(request.headers.get("content-length")) > 2048) {
    return Response.json(
      { message: "Слишком большой запрос." },
      { status: 413 },
    );
  }
  const body = await request.text();
  if (body.length > 2048)
    return Response.json(
      { message: "Слишком большой запрос." },
      { status: 413 },
    );
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return Response.json(
      { message: "Проверьте адрес почты." },
      { status: 400 },
    );
  }
  const result = subscription.safeParse(parsed);
  if (!result.success)
    return Response.json(
      { message: "Укажите корректную почту и согласие на письма." },
      { status: 400 },
    );
  const webhook = process.env.3D Бирка_NEWSLETTER_WEBHOOK_URL;
  if (!webhook)
    return Response.json(
      {
        message:
          "Подписка пока не подключена. Адрес не сохранён; попробуйте позже.",
      },
      { status: 503 },
    );
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.3D Бирка_NEWSLETTER_TOKEN
          ? { Authorization: `Bearer ${process.env.3D Бирка_NEWSLETTER_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ ...result.data, source: "3D Бирка-new-products" }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Subscription service unavailable");
    return Response.json({
      message: "Вы подписаны! Сообщим о появлении опор и кашпо.",
    });
  } catch {
    return Response.json(
      { message: "Сервис подписки временно недоступен. Попробуйте позже." },
      { status: 502 },
    );
  }
}
