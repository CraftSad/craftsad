import { createHydrationOptions } from "@orpc/tanstack-query";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

const hydration = createHydrationOptions();

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        ...hydration.dehydrate,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => false,
      },
      hydrate: hydration.hydrate,
    },
  });
