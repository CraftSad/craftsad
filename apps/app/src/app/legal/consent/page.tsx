import type { Metadata } from "next";
import { LEGAL_DOCUMENTS, LEGAL_ENTITY } from "~/components/legal/legal-data";
import { LegalDocumentView } from "~/components/legal/legal-document-view";

export const metadata: Metadata = {
  title: `${LEGAL_DOCUMENTS.consent.shortTitle} — 3D Бирка`,
  description: `${LEGAL_DOCUMENTS.consent.title} (ст. 9 ФЗ-152). Оператор: ${LEGAL_ENTITY.shortName}, ИНН ${LEGAL_ENTITY.inn}.`,
};

export default function ConsentPage() {
  return <LegalDocumentView docId="consent" />;
}
