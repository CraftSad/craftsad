import { createHash } from "node:crypto";
import { logger } from "@acme/config";
import { type Database, db } from "@acme/db";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, phoneNumber } from "better-auth/plugins";

import { ADMIN_ROLE, hasAdminRole, isAdminEmail } from "./roles";
import { smsProvider } from "./sms";

const tempEmail = (phone: string) =>
  `${createHash("sha256").update(phone).digest("hex")}@phone.3dbirka.invalid`;

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  googleClientId?: string;
  googleClientSecret?: string;
  sendEmail?: (data: {
    email: string;
    otp?: string;
    url?: string;
    type: "sign-in" | "email-verification" | "forget-password" | "change-email";
  }) => Promise<void>;
  /**
   * Runs a promise after the response is sent (e.g. Next.js `after`, Vercel
   * `waitUntil`). Without it, emails are awaited inside the request.
   */
  runInBackground?: (promise: Promise<unknown>) => void;
  extraPlugins?: TExtraPlugins;
  /** Defaults to the app database; tests pass an in-memory PGlite one. */
  database?: Database;
}) {
  const config = {
    database: drizzleAdapter(options.database ?? db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    /**
     * OTP, password-reset and verification emails go through Better Auth's
     * background tasks: the response no longer waits for the email provider,
     * so a slow or failing provider can't break sign-in, and response time
     * doesn't reveal whether an account exists. Failures are logged.
     * @see https://www.better-auth.com/docs/reference/options#advanced
     */
    ...(options.runInBackground && {
      advanced: {
        backgroundTasks: { handler: options.runInBackground },
      },
    }),
    /**
     * Built-in rate limiting protects auth endpoints (sign-in, OTP, password
     * reset) from brute-force and abuse. Tune per environment as needed.
     *
     * Counters live in Postgres (`rate_limits` table) so limits hold across
     * serverless invocations and multiple instances; the default in-memory
     * store is per-process and effectively disabled on Vercel.
     * @see https://www.better-auth.com/docs/concepts/rate-limit
     */
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
    },
    emailAndPassword: { enabled: false },
    plugins: [
      emailOTP({
        otpLength: 6,
        allowedAttempts: 5,
        expiresIn: 300,
        storeOTP: "hashed",
        rateLimit: { window: 60, max: 1 },
        async sendVerificationOTP(data) {
          if (options.sendEmail) {
            await options.sendEmail({
              email: data.email,
              otp: data.otp,
              type: data.type,
            });
          }
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
            `Ваш код для входа в 3dbirka: ${code}. Никому его не сообщайте.`,
          ),
      }),
      /**
       * Roles, bans and impersonation; endpoints under /api/auth/admin/*
       * (`authClient.admin.*`). `adminProcedure` checks the same role.
       * @see https://www.better-auth.com/docs/plugins/admin
       */
      admin({ defaultRole: "customer", adminRoles: [ADMIN_ROLE] }),
      ...(options.extraPlugins ?? []),
    ],
    // ADMIN_EMAILS bootstrap: listed emails sign up as admins, and existing
    // listed accounts are promoted on their next sign-in.
    databaseHooks: {
      user: {
        create: {
          async before(user) {
            if (!isAdminEmail(user.email)) return;
            return { data: { ...user, role: ADMIN_ROLE } };
          },
        },
      },
      session: {
        create: {
          async after(session, ctx) {
            if (!ctx) return;
            const adapter = ctx.context.internalAdapter;
            const user = await adapter.findUserById(session.userId);
            if (!user || !isAdminEmail(user.email)) return;
            // `role` comes from the admin plugin; the adapter types the base user.
            if (hasAdminRole((user as { role?: unknown }).role)) return;
            await adapter.updateUser(user.id, { role: ADMIN_ROLE });
          },
        },
      },
    },
    onAPIError: {
      onError(error) {
        logger.error("auth.api_error", error);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
