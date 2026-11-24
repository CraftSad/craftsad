import { db, otpSendLimits, sql } from "@acme/db";
import { z } from "zod";
import { auth } from "~/auth/server";

const otpBodySchema = z.object({
  email: z.unknown().optional(),
  phoneNumber: z.unknown().optional(),
});

export const GET = auth.handler;
export async function POST(request: Request) {
  const path = new URL(request.url).pathname;
  const emailSend = path.endsWith("/email-otp/send-verification-otp");
  const phoneSend = path.endsWith("/phone-number/send-otp");
  if (emailSend || phoneSend) {
    const body = otpBodySchema.safeParse(
      await request
        .clone()
        .json()
        .catch(() => undefined),
    );
    const identifier = body.success
      ? emailSend
        ? body.data.email
        : body.data.phoneNumber
      : undefined;
    if (
      typeof identifier !== "string" ||
      !identifier.trim() ||
      identifier.length > 254
    )
      return Response.json(
        { error: "Укажите почту или телефон" },
        { status: 400 },
      );
    const key = `${emailSend ? "email" : "phone"}:${identifier.trim().toLowerCase()}`;
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
      return Response.json(
        { error: "Пожалуйста, подождите 60 секунд перед запросом нового кода" },
        { status: 429 },
      );
  }
  return auth.handler(request);
}
