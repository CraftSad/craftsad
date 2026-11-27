import { paths } from "@acme/config";
import { ArrowLeft, BookOpen, Leaf } from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "~/components/3dbirka/brand";
import { ContactLink } from "~/components/3dbirka/contact-link";
import { LEGAL_ENTITY } from "~/components/legal/legal-data";

export function BlogHeader() {
  return (
    <header className="relative z-[20] border-bottom-[1px] border-bottom-[#b5965c40] [background:#fbf8f0f2]">
      <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] flex min-h-[84px] items-center justify-between gap-[24px] max-[640px]:gap-[12px] max-[800px]:min-h-[70px]">
        <Link
          href={paths.dashboard.root}
          className="border-0 [background:none] inline-flex items-center gap-[12px] p-0 text-left text-forest font-display text-[33px] font-semibold leading-[.9] whitespace-nowrap tracking-[-.02em] max-[1100px]:text-[26px] max-[370px]:gap-[6px] max-[570px]:gap-[9px] max-[570px]:text-[26px] max-[800px]:text-[28px] [&_small]:block [&_small]:font-[500] [&_small]:text-[8px] [&_small]:leading-[1.4] [&_small]:font-craft [&_small]:tracking-[.17em] [&_small]:uppercase [&_small]:text-[#637064] [&_small]:mt-[9px] max-[1100px]:[&_small]:text-[9px] max-[570px]:[&_small]:hidden max-[570px]:[&_small]:text-[6px] max-[570px]:[&_small]:tracking-[.1em] [&>span:last-child]:text-ink [&>span:last-child]:font-semibold [&>span:last-child]:tracking-[-.02em] max-[370px]:[&_small]:tracking-[0] no-underline"
          aria-label="3D Бирка — в магазин"
        >
          <BrandLockup />
        </Link>
        <nav
          className="flex items-center gap-[14px]"
          aria-label="Навигация по журналу"
        >
          <span className="inline-flex items-center gap-[8px] mr-[8px] text-ink text-[15px] font-semibold max-[800px]:hidden [&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:text-[var(--brass)]">
            <BookOpen aria-hidden="true" />
            Журнал
          </span>
          <Link
            href={paths.dashboard.root}
            className="inline-flex items-center gap-[7px] py-[10px] px-[18px] border border-solid border-[#d8decd] rounded-full [background:#fff] text-forest text-[14px] font-semibold no-underline [transition:background_0.2s,transform_0.2s] hover:[background:#f0f2e9] hover:[transform:translateY(-1px)] max-[640px]:py-[9px] max-[640px]:px-[14px] max-[640px]:text-[13px] [&_svg]:w-[16px] [&_svg]:h-[16px]"
          >
            <ArrowLeft aria-hidden="true" />В магазин
          </Link>
          <ContactLink compact />
        </nav>
      </div>
    </header>
  );
}

export function BlogFooter() {
  return (
    <footer className="mt-[clamp(48px,7vw,96px)] border-top-[1px] border-top-[#b5965c66] [background:#111c18] text-[#f6f4ef]">
      <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] grid grid-cols-[1.6fr_1fr_1fr] gap-[40px] py-[56px_40px] max-[800px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-[800px]:gap-[32px_24px] [&_p]:m-0 [&_p]:text-[#b9c6b5] [&_p]:text-[14px] [&_p]:leading-[1.8] max-[800px]:[&>div:first-child]:col-[1/-1]">
        <div>
          <strong className="block mb-[14px]">
            <BrandLockup />
          </strong>
          <p>
            Сад начинается с имени.
            <br />
            Журнал мастерской 3D Бирка.
          </p>
          <p className="blog-footer-note">
            Обложки статей — 3D-визуализации мастерской с точной геометрией
            бирки; фотографии в текстах — реальные снимки нашей грядки.
          </p>
        </div>
        <div>
          <span>Мастерская</span>
          <Link
            href={paths.dashboard.root}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Каталог и конструктор
          </Link>
          <Link
            href={`${paths.dashboard.root}#faq`}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Частые вопросы
          </Link>
          <Link
            href={paths.legal.delivery}
            className="block text-[#b9c6b5] text-[14px] leading-[1.8] py-[4px] px-[0] no-underline hover:underline hover:text-[#f5f5ef]"
          >
            Оплата и доставка
          </Link>
          <ContactLink />
        </div>
        <div>
          <span>Документы</span>
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
        </div>
      </div>
      <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)] flex items-center justify-between gap-[16px] py-[20px_26px] border-top-[1px] border-top-[#ffffff1f] text-[#a0ad9a] text-[12px] max-[640px]:flex-col max-[640px]:items-start">
        <span>
          © 2026 3D Бирка · {LEGAL_ENTITY.shortName}, ИНН {LEGAL_ENTITY.inn}
        </span>
        <span
          className="inline-flex gap-[2px] text-[#6f8a63] [&_svg]:w-[15px] [&_svg]:h-[15px]"
          aria-hidden="true"
        >
          <Leaf />
          <Leaf />
          <Leaf />
        </span>
      </div>
    </footer>
  );
}
