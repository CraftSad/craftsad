import { paths } from "@acme/config";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "~/components/3dbirka/brand";
import {
  LEGAL_DOC_LIST,
  LEGAL_DOCUMENTS,
  LEGAL_ENTITY,
  type LegalDocId,
} from "./legal-data";

export function LegalDocumentView({ docId }: { docId: LegalDocId }) {
  const doc = LEGAL_DOCUMENTS[docId];

  return (
    <div className="[background:radial-gradient(ellipse_at_85%_8%,#dce2d366,transparent_34%),#f5f1e8] text-ink font-craft text-[18px] leading-[1.55] overflow-clip isolate before:content-[''] before:fixed before:inset-0 before:pointer-events-none before:opacity-[.035] before:z-[30] before:bg-grain [&_button]:cursor-pointer [&_button]:touch-manipulation [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-[.6] [&_button:focus-visible]:[outline:3px_solid_#c87d55] [&_button:focus-visible]:outline-offset-[5px] [&_input:focus-visible]:[outline:3px_solid_#b86b43] [&_input:focus-visible]:outline-offset-[3px] [&_textarea:focus-visible]:[outline:3px_solid_#b86b43] [&_textarea:focus-visible]:outline-offset-[3px] [&_h1]:font-display [&_h1]:font-medium [&_h2]:font-display [&_h2]:font-medium [&_h3]:font-display [&_h3]:font-medium [&_section[id]]:scroll-mt-[118px] [&_a:focus-visible]:[outline:3px_solid_#c87d55] [&_a:focus-visible]:outline-offset-[5px] [&_svg]:shrink-0 min-h-svh flex flex-col">
      <header className="border-b border-[#e6e2da] bg-[#faf8f5]">
        <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <Link
            href={paths.dashboard.root}
            className="border-0 [background:none] inline-flex items-center gap-[12px] p-0 text-left text-forest font-display text-[33px] font-semibold leading-[.9] whitespace-nowrap tracking-[-.02em] max-[1100px]:text-[26px] max-[370px]:gap-[6px] max-[570px]:gap-[9px] max-[570px]:text-[26px] max-[800px]:text-[28px] [&_small]:block [&_small]:font-[500] [&_small]:text-[8px] [&_small]:leading-[1.4] [&_small]:font-craft [&_small]:tracking-[.17em] [&_small]:uppercase [&_small]:text-[#637064] [&_small]:mt-[9px] max-[1100px]:[&_small]:text-[9px] max-[570px]:[&_small]:hidden max-[570px]:[&_small]:text-[6px] max-[570px]:[&_small]:tracking-[.1em] [&>span:last-child]:text-ink [&>span:last-child]:font-semibold [&>span:last-child]:tracking-[-.02em] max-[370px]:[&_small]:tracking-[0] no-underline"
          >
            <BrandLockup />
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

      <main className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] flex-1 py-10 md:py-16">
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
              <span className="inline-flex items-center gap-[10px] uppercase tracking-[.17em] text-[13px] font-extrabold text-[#8b492e]">
                Правовая информация
              </span>
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
        <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] flex flex-col justify-between gap-3 md:flex-row md:items-center">
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
