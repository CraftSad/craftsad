import { paths } from "@acme/config";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "~/components/3dbirka/brand";
import { LEGAL_DOC_LIST, LEGAL_ENTITY } from "~/components/legal/legal-data";
import { absoluteUrl } from "~/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl(paths.legal.root),
  },
  title: "Правовая информация и реквизиты — 3D Бирка",
  description: `Юридические документы магазина «3D Бирка»: публичная оферта, политика обработки персональных данных, условия доставки и возврата. ${LEGAL_ENTITY.shortName}, ИНН ${LEGAL_ENTITY.inn}.`,
};

export default function LegalIndexPage() {
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
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <span className="inline-flex items-center gap-[10px] uppercase tracking-[.17em] text-[13px] font-extrabold text-[#8b492e]">
              Документы и реквизиты
            </span>
            <h1 className="mt-3 text-3xl leading-tight font-medium text-[#172b22] md:text-5xl">
              Правовая информация
            </h1>
            <p className="mt-3 text-base text-[#526056]">
              Все документы составлены в соответствии с законодательством
              Российской Федерации (ГК РФ, Закон РФ № 2300-1 «О защите прав
              потребителей», ФЗ № 152-ФЗ «О персональных данных», ФЗ № 422-ФЗ «О
              проведении эксперимента по установлению специального налогового
              режима „Налог на профессиональный доход“»).
            </p>
          </div>

          <section
            aria-label="Сведения о продавце и операторе персональных данных"
            className="rounded-3xl border border-[#d8decd] bg-white p-6 shadow-xs md:p-8"
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 size-6 shrink-0 text-[#1b4332]" />
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-[#172b22]">
                  Сведения о продавце и операторе персональных данных
                </h2>
                <dl className="grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-[#526056]">Продавец (исполнитель)</dt>
                    <dd className="font-semibold text-[#172b22]">
                      {LEGAL_ENTITY.fullName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#526056]">ИНН</dt>
                    <dd className="font-semibold text-[#172b22]">
                      {LEGAL_ENTITY.inn}
                    </dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-[#526056]">Налоговый статус</dt>
                    <dd className="font-medium text-[#172b22]">
                      {LEGAL_ENTITY.status}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {LEGAL_DOC_LIST.map((doc) => (
              <Link
                key={doc.id}
                href={doc.href}
                className="group flex flex-col justify-between rounded-2xl border border-[#e6e2da] bg-white p-6 no-underline transition hover:border-[#1b4332]"
              >
                <div className="space-y-2">
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-[#f0f2e9] text-[#1b4332]">
                    <FileText className="size-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#172b22]">
                    {doc.shortTitle}
                  </h2>
                  <p className="text-sm text-[#526056]">{doc.subtitle}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1b4332]">
                  Открыть документ
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e6e2da] bg-[#111c18] py-8 text-sm text-[#b9c6b5]">
        <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            © 2026 {LEGAL_ENTITY.brand} · {LEGAL_ENTITY.shortName}, ИНН{" "}
            {LEGAL_ENTITY.inn} (самозанятый / НПД)
          </div>
          <Link
            href={paths.dashboard.root}
            className="text-[#e1e9d9] underline underline-offset-4"
          >
            На главную страницу
          </Link>
        </div>
      </footer>
    </div>
  );
}
