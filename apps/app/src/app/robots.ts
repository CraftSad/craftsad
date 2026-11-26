import type { MetadataRoute } from "next";
import { absoluteUrl, INDEXING_ENABLED } from "~/seo";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXING_ENABLED) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api", "/dashboard", "/settings"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
