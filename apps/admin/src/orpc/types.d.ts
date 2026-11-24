import type { adminRouter } from "@acme/admin-api";
import type { RouterClient } from "@orpc/server";

declare global {
  // eslint-disable-next-line no-var
  var $adminClient: RouterClient<typeof adminRouter> | undefined;
}
