import type { Session } from "@acme/auth";
import { isAdmin } from "@acme/auth/roles";
import { logger } from "@acme/config";
import { db } from "@acme/db";
import { os } from "@orpc/server";

/**
 * oRPC context for the admin API.
 *
 * Mirrors `@acme/api`: the context is decoupled from a concrete
 * `better-auth` instance, so callers resolve the session themselves and pass
 * it in. Keeping the package independent lets `apps/admin` own its auth
 * runtime without coupling `@acme/admin-api` to it.
 */
export interface CreateAdminORPCContextOptions {
  /** Request headers, kept on the context for procedures that need them. */
  headers: Headers;
  /** Pre-resolved session (or `null` for anonymous requests). */
  session: Session | null;
}

export function createAdminORPCContext(opts: CreateAdminORPCContextOptions) {
  return {
    session: opts.session,
    headers: opts.headers,
    db,
  };
}

const o = os.$context<ReturnType<typeof createAdminORPCContext>>();

const timingMiddleware = o.middleware(async ({ next, path }) => {
  const start = Date.now();

  try {
    return await next();
  } finally {
    logger.info("admin-orpc.request", {
      path: Array.isArray(path) ? path.join(".") : path,
      durationMs: Date.now() - start,
    });
  }
});

export const publicProcedure = o.use(timingMiddleware);

export const protectedProcedure = publicProcedure
  .errors({
    UNAUTHORIZED: { message: "Войдите в аккаунт, чтобы продолжить" },
  })
  .use(({ context, next, errors }) => {
    if (!context.session?.user) {
      throw errors.UNAUTHORIZED();
    }

    return next({
      context: {
        session: { ...context.session, user: context.session.user },
      },
    });
  });

/**
 * Admin-only procedure.
 *
 * Admin = the `admin` role from Better Auth's admin plugin, or an email in
 * `ADMIN_EMAILS` (the bootstrap list). Same rule as `@acme/api`.
 */
export const adminProcedure = protectedProcedure
  .errors({
    FORBIDDEN: { message: "Требуются права администратора" },
  })
  .use(({ context, next, errors }) => {
    if (!isAdmin(context.session.user)) {
      throw errors.FORBIDDEN();
    }

    return next();
  });

export type AdminORPCContext = ReturnType<typeof createAdminORPCContext>;
