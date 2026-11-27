"use client";

import { paths } from "@acme/config";
import Link from "next/link";
import { LEGAL_ENTITY } from "~/components/legal/legal-data";
import { BrandLockup } from "./brand";
import { ContactLink } from "./contact-link";

export function SiteFooter({
  year,
  onNavigate,
  onShowLogin,
}: {
  year: number;
  onNavigate: (id: string) => void;
  onShowLogin: () => void;
}) {
  return (
    <footer className="[background:#111c18] text-[#f5f5ef] pt-[67px] pb-[25px] pt-[60px] border-top-[1px] border-top-[#b5965c66] [&_strong]:font-[500] [&_strong]:text-[44px] [&_strong]:font-display [&_p]:text-[#b9c6b5] [&_p]:text-[14px] [&_p]:leading-[1.8] [&_span]:block [&_span]:text-[#e1e9d9] [&_span]:font-medium [&_span]:text-[13px] [&_span]:mb-[14px] [&_button]:block [&_button]:border-0 [&_button]:[background:none] [&_button]:text-[#b9c6b5] [&_button]:py-[4px] [&_button]:px-[0] [&_button]:text-[14px] [&_button]:text-left [&_button]:leading-[1.8] [&_button:hover]:underline max-[800px]:[&_p]:text-[12px] max-[800px]:[&_button]:text-[12px] max-[570px]:[&_p]:text-[14px] max-[570px]:[&_button]:text-[14px]">
      <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
        <div>
          <strong className="inline-flex items-center gap-[12px] font-[500] text-[40px] leading-[1] font-display text-[#f6f4ef] tracking-[-.02em] mb-[15px] whitespace-nowrap text-left max-[570px]:text-[34px] max-[570px]:gap-[10px] [&_em]:italic [&_em]:font-normal [&_em]:text-[#d6b293] [&_small]:block [&_small]:font-[500] [&_small]:text-[8px] [&_small]:leading-[1.4] [&_small]:font-craft [&_small]:uppercase [&_small]:tracking-[.17em] [&_small]:text-[#c1cbb9]">
            <BrandLockup />
          </strong>
          <p>
            Садовые бирки с вашим характером.
            <br />
            Имена, которым придали форму.
          </p>
          <p className="mt-3 text-xs text-[#9ba996]">
            {LEGAL_ENTITY.shortName}
            <br />
            ИНН {LEGAL_ENTITY.inn} · Самозанятый (НПД)
          </p>
        </div>
        <div>
          <span>Магазин</span>
          <button type="button" onClick={() => onNavigate("catalog")}>
            Готовые наборы
          </button>
          <button type="button" onClick={() => onNavigate("constructor")}>
            Создать свои бирки
          </button>
          <button type="button" onClick={() => onNavigate("faq")}>
            Частые вопросы
          </button>
          <Link
            href={paths.blog.root}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Журнал мастерской
          </Link>
          <Link
            href={paths.legal.delivery}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Оплата, доставка и возврат
          </Link>
        </div>
        <div>
          <span>Помощь и документы</span>
          <ContactLink />
          <p>
            Доставка в пункты Ozon
            <br />
            по всей России
          </p>
          <button type="button" onClick={onShowLogin}>
            Личный кабинет
          </button>
          <Link
            href={paths.legal.offer}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Публичная оферта
          </Link>
          <Link
            href={paths.legal.privacy}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Политика конфиденциальности
          </Link>
          <Link
            href={paths.legal.consent}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Согласие на обработку ПДн
          </Link>
          <Link
            href={paths.legal.cookies}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Файлы cookie
          </Link>
        </div>
      </div>
      <div className="border-top-[1px] border-top-[#ffffff26] mt-[50px] pt-[22px] flex justify-between text-[#b6c5b8] text-[14px] max-[570px]:gap-[10px] [&_span]:text-[11px] [&_span]:text-[#a0ad9a] [&_span]:font-normal [&_span]:m-0 max-[570px]:[&_span]:text-[10px] w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
        <span>
          © {year} 3D Бирка · {LEGAL_ENTITY.shortName}, ИНН {LEGAL_ENTITY.inn}
        </span>
        <span>Сад начинается с имени.</span>
      </div>
    </footer>
  );
}
