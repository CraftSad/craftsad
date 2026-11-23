import { createHash } from "node:crypto";
import { db } from "@acme/db";
import { sendEmailHtml } from "@acme/emails";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, phoneNumber } from "better-auth/plugins";

export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

export const smsProvider: SmsProvider = {
  async send(phone, message) {
    const apiId = process.env.SMS_RU_API_ID;
    if (!apiId) throw new Error("SMS_RU_API_ID не настроен");
    const recipient = phone.replace(/^\+/, "");
    const response = await fetch("https://sms.ru/sms/send", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_id: apiId,
        to: recipient,
        msg: message,
        json: "1",
      }),
    });
    const result = (await response.json()) as {
      status?: string;
      status_code?: number;
      sms?: Record<string, { status?: string; status_code?: number }>;
    };
    if (
      !response.ok ||
      result.status !== "OK" ||
      result.sms?.[recipient]?.status !== "OK"
    )
      throw new Error(
        `SMS.ru: ${result.sms?.[recipient]?.status_code ?? result.status_code ?? response.status}`,
      );
  },
};

const tempEmail = (phone: string) =>
  `${createHash("sha256").update(phone).digest("hex")}@phone.craftsad.invalid`;

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: process.env.STORE_API_URL ?? "http://localhost:7000",
  secret: process.env.AUTH_SECRET,
  trustedOrigins: [process.env.APP_URL ?? "http://localhost:3000"],
  emailAndPassword: { enabled: false },
  // The per-recipient send gate and plugin attempt limits are authoritative.
  // Keep the broad fallback bucket large because Bun may not expose a client IP.
  rateLimit: { enabled: true, storage: "database", window: 60, max: 1000 },
  plugins: [
    emailOTP({
      otpLength: 6,
      allowedAttempts: 5,
      expiresIn: 300,
      storeOTP: "hashed",
      rateLimit: { window: 60, max: 1 },
      async sendVerificationOTP({ email, otp }) {
        await sendEmailHtml({
          to: [email],
          subject: "Код для входа в CraftSad",
          html: `<p>Ваш код для входа в CraftSad: <strong>${otp}</strong>.</p><p>Никому его не сообщайте. Код действует 5 минут.</p>`,
        });
      },
    }),
    phoneNumber({
      otpLength: 6,
      allowedAttempts: 5,
      expiresIn: 300,
      phoneNumberValidator: (phone) => /^\+7\d{10}$/.test(phone),
      signUpOnVerification: {
        getTempEmail: tempEmail,
        getTempName: () => "Покупатель",
      },
      sendOTP: ({ phoneNumber: phone, code }) =>
        smsProvider.send(
          phone,
          `Ваш код для входа в CraftSad: ${code}. Никому его не сообщайте.`,
        ),
    }),
    admin({ defaultRole: "customer", adminRoles: ["admin"] }),
  ],
});
