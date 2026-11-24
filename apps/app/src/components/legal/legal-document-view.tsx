import { paths } from "@acme/config";
import { ArrowLeft, FileText, Leaf, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
  LEGAL_DOC_LIST,
  LEGAL_DOCUMENTS,
  LEGAL_ENTITY,
  type LegalDocId,
} from "./legal-data";

export function LegalDocumentView({ docId }: { docId: LegalDocId }) {
  const doc = LEGAL_DOCUMENTS[docId];

  return (
    <div className="birka-site min-h-svh flex flex-col">
      <header className="border-b border-[#e6e2da] bg-[#faf8f5]">
        <div className="birka-container flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <Link
            href={paths.dashboard.root}
            className="birka-brand no-underline"
          >
            <span className="birka-brand-mark">
              <Leaf />
            </span>
            <span>
              3D<span> Бирка</span>
            </span>
          </Link>
          <Link
            href={paths.dashboard.root}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8decd] bg-white px-4 py-2 text-sm font-semibold text-[#1b4332] no-underline transition hover:bg-[#f0f2e9]"
          >
            <ArrowLeft className="size-4" />
            Вернуться в магазин
          </Link>
        </div>
      </header>

      <main className="birka-container flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-4xl">
          <nav
            aria-label="Правовые документы"
            className="mb-8 flex flex-wrap gap-2"
          >
            {LEGAL_DOC_LIST.map((item) => {
              const active = item.id === docId;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "inline-flex items-center gap-1.5 rounded-full bg-[#1b4332] px-4 py-2 text-sm font-semibold text-white no-underline"
                      : "inline-flex items-center gap-1.5 rounded-full border border-[#d8decd] bg-white px-4 py-2 text-sm font-medium text-[#172b22] no-underline transition hover:bg-[#f0f2e9]"
                  }
                >
                  <FileText className="size-3.5" />
                  {item.shortTitle}
                </Link>
              );
            })}
          </nav>

          <article className="rounded-3xl border border-[#e6e2da] bg-white p-6 shadow-xs md:p-12">
            <div className="border-b border-[#e6e2da] pb-6">
              <span className="birka-eyebrow">Правовая информация</span>
              <h1 className="mt-3 text-3xl leading-tight font-medium text-[#172b22] md:text-4xl">
                {doc.title}
              </h1>
              <p className="mt-3 text-base text-[#526056]">{doc.subtitle}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#d8decd] bg-[#f6f4ef] p-5 text-sm text-[#172b22]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#1b4332]" />
                <div className="space-y-1">
                  <div className="font-semibold">
                    {LEGAL_ENTITY.shortName} · ИНН {LEGAL_ENTITY.inn}
                  </div>
                  <div className="text-[#526056]">{LEGAL_ENTITY.status}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-8 text-base leading-relaxed text-[#1f2421]">
              {doc.sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="text-xl font-semibold text-[#172b22] md:text-2xl">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-[#2c3630]">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc space-y-2 pl-6 text-[#2c3630]">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-[#e6e2da] bg-[#111c18] py-8 text-sm text-[#b9c6b5]">
        <div className="birka-container flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            © 2026 {LEGAL_ENTITY.brand} · {LEGAL_ENTITY.shortName}, ИНН{" "}
            {LEGAL_ENTITY.inn} (самозанятый / НПД)
          </div>
          <Link
            href={paths.legal.root}
            className="text-[#e1e9d9] underline underline-offset-4"
          >
            Все правовые документы
          </Link>
        </div>
      </footer>
    </div>
  );
}
