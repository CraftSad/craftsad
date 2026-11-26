"use client";

import { useEffect } from "react";
import { ErrorPage } from "./error-page";

interface RuntimeErrorPageProps {
  error: unknown;
  retry: () => void;
  compact?: boolean;
  global?: boolean;
}

export function RuntimeErrorPage({
  error,
  retry,
  compact = false,
  global = false,
}: RuntimeErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      code="500"
      errorId={getErrorDigest(error)}
      onRetry={retry}
      compact={compact}
      global={global}
    />
  );
}

function getErrorDigest(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string"
  ) {
    return error.digest;
  }

  return undefined;
}
