"use client";

import { RuntimeErrorPage } from "~/components/errors/runtime-error-page";

export default function DashboardError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <RuntimeErrorPage error={error} retry={retry} compact />;
}
