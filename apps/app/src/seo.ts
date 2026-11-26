import "server-only";

import { env } from "@acme/config";

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

const productionUrl = env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  : env.APP_URL;

export const SITE_URL = stripTrailingSlash(productionUrl);

export const DEPLOYMENT_URL = stripTrailingSlash(
  env.VERCEL_ENV === "preview" && env.VERCEL_URL
    ? `https://${env.VERCEL_URL}`
    : SITE_URL,
);

export const INDEXING_ENABLED =
  env.VERCEL_ENV === "production" ||
  (env.VERCEL_ENV === undefined && env.NODE_ENV === "production");

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? SITE_URL : `${SITE_URL}${normalizedPath}`;
}
