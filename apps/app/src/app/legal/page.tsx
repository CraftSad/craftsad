import { paths } from "@acme/config";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "~/components/3dbirka/brand";
import { LEGAL_DOC_LIST, LEGAL_ENTITY } from "~/components/legal/legal-data";

export const metadata: Metadata = {
  title: "Правовая информация и реквизиты — 3D Бирка",
  description: `Юридические документы магазина «3D Бирка»: публичная оферта, политика обработки персональных данных, условия доставки и возврата. ${LEGAL_ENTITY.shortName}, ИНН ${LEGAL_ENTITY.inn}.`,
};

export default function LegalIndexPage() {
  return (
    <div className="birka-site min-h-svh flex flex-col">
      <header className="border-b border-[#e6e2da] bg-[#faf8f5]">
        <div className="birka-container flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <Link
            href={paths.dashboard.root}
            className="birka-brand no-underline"
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

      <main className="birka-container flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <span className="birka-eyebrow">Документы и реквизиты</span>
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
        <div className="birka-container flex flex-col justify-between gap-3 md:flex-row md:items-center">
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
