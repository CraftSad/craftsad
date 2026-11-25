import type { Metadata } from "next";
import { LEGAL_DOCUMENTS, LEGAL_ENTITY } from "~/components/legal/legal-data";
import { LegalDocumentView } from "~/components/legal/legal-document-view";

export const metadata: Metadata = {
  title: `${LEGAL_DOCUMENTS.cookies.shortTitle} — 3D Бирка`,
  description: `${LEGAL_DOCUMENTS.cookies.title}. ${LEGAL_ENTITY.shortName}, ИНН ${LEGAL_ENTITY.inn}.`,
};

export default function CookiesPage() {
  return <LegalDocumentView docId="cookies" />;
}
