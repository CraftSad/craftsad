"use client";

import type { adminRouter } from "@acme/admin-api";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { env } from "~/env";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  return (clientQueryClientSingleton ??= createQueryClient());
};

const API_PATH = "/api/orpc";

const getApiOrigin = () => {
  if (env.NEXT_PUBLIC_ADMIN_API_URL) {
    return new URL(env.NEXT_PUBLIC_ADMIN_API_URL).origin;
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3001";
};

const link = new RPCLink({
  origin: getApiOrigin(),
  url: API_PATH,
});

const client: RouterClient<typeof adminRouter> =
  globalThis.$adminClient ?? createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);

export function ORPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
