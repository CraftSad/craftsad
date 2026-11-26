import type { Metadata } from "next";
import { Storefront } from "~/components/3dbirka/storefront";
import { absoluteUrl } from "~/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

export default function HomePage() {
  return <Storefront />;
}
