"use client";

import { useEffect } from "react";
import { ErrorPage } from "./error-page";

interface RuntimeErrorPageProps {
  error: unknown;
  retry: () => void;
  compact?: boolean;
}

export function RuntimeErrorPage({
  error,
  retry,
  compact = false,
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
