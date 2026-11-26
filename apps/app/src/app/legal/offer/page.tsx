import type { Metadata } from "next";
import { LEGAL_DOCUMENTS, LEGAL_ENTITY } from "~/components/legal/legal-data";
import { LegalDocumentView } from "~/components/legal/legal-document-view";
import { absoluteUrl } from "~/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl(LEGAL_DOCUMENTS.offer.href),
  },
  title: `${LEGAL_DOCUMENTS.offer.shortTitle} — 3D Бирка`,
  description: `${LEGAL_DOCUMENTS.offer.title}. ${LEGAL_ENTITY.shortName}, ИНН ${LEGAL_ENTITY.inn}.`,
};

export default function OfferPage() {
  return <LegalDocumentView docId="offer" />;
}
