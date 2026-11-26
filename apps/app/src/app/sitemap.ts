import { paths } from "@acme/config";
import type { MetadataRoute } from "next";
import { LEGAL_DOC_LIST } from "~/components/legal/legal-data";
import { absoluteUrl } from "~/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl("/images/3dbirka-garden.png")],
    },
    {
      url: absoluteUrl(paths.legal.root),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...LEGAL_DOC_LIST.map((doc) => ({
      url: absoluteUrl(doc.href),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
