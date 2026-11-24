import { adminRouter, createAdminORPCContext } from "@acme/admin-api";
import { env, logger } from "@acme/config";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSHandlerPlugin } from "@orpc/server/plugins";

const handler = new RPCHandler(adminRouter, {
  plugins: [
    new CORSHandlerPlugin({
      origin: new URL(env.ADMIN_URL).origin,
      credentials: true,
    }),
  ],
  interceptors: [
    onError((error) => {
      logger.error("admin_orpc.handler_error", error);
    }),
  ],
});

async function handleRequest(request: Request) {
  const session =
    request.method === "OPTIONS"
      ? null
      : await (await import("~/auth/server")).auth.api.getSession({
          headers: request.headers,
        });

  const { response } = await handler.handle(request, {
    prefix: "/api/orpc",
    context: createAdminORPCContext({
      headers: request.headers,
      session,
    }),
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const OPTIONS = handleRequest;
export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
