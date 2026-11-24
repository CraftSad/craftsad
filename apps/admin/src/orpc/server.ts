import "server-only";

import { adminRouter, createAdminORPCContext } from "@acme/admin-api";
import { createRouterClient } from "@orpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "~/auth/server";

const createServerContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-orpc-source", "rsc");

  const session = await auth.api.getSession({ headers: heads });

  return createAdminORPCContext({
    headers: heads,
    session,
  });
});

globalThis.$adminClient = createRouterClient(adminRouter, {
  context: createServerContext,
});

export const api = globalThis.$adminClient;
