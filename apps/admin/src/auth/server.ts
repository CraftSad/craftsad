import "server-only";

import { initAuth } from "@acme/auth";
import { env, logger } from "@acme/config";
import { dispatchEmail } from "@acme/jobs";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { after } from "next/server";
import { cache } from "react";

/**
 * The admin panel runs its own Better Auth instance against the shared
 * database. Sessions created here live on the admin origin; the same accounts
 * (and `ADMIN_EMAILS` bootstrap) are used by the storefront.
 */
export const auth = initAuth({
  baseUrl: env.ADMIN_URL,
  productionUrl: env.ADMIN_URL,
  secret: env.AUTH_SECRET,
  adminOnly: true,
  extraPlugins: [nextCookies()],
  runInBackground: (promise) => {
    try {
      after(promise);
    } catch {
      void promise;
    }
  },
  sendEmail: async ({
    email,
    otp,
    url,
    type,
  }: {
    email: string;
    otp?: string;
    url?: string;
    type: "sign-in" | "email-verification" | "forget-password" | "change-email";
  }) => {
    if (type === "forget-password") {
      if (!url) {
        logger.error("admin_auth.reset_email_missing_url");
        throw new Error(
          "Cannot send password reset email: reset URL is missing",
        );
      }
      await dispatchEmail({
        template: "reset-password",
        to: [email],
        subject: "Сброс пароля",
        props: { resetLink: url },
      });
    } else {
      if (!otp) {
        logger.error("admin_auth.otp_email_missing_otp", undefined, { type });
        throw new Error(`Cannot send ${type} email: OTP is missing`);
      }
      await dispatchEmail({
        template: "otp-sign-in",
        to: [email],
        subject:
          type === "sign-in"
            ? "Ваш код для входа в админку"
            : "Подтвердите адрес электронной почты",
        props: { otp, isSignUp: type !== "sign-in" },
      });
    }
  },
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
