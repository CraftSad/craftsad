import { paths } from "@acme/config";
import { ArrowLeft, BookOpen, Leaf } from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "~/components/3dbirka/brand";
import { ContactLink } from "~/components/3dbirka/contact-link";
import { LEGAL_ENTITY } from "~/components/legal/legal-data";

export function BlogHeader() {
  return (
    <header className="blog-header">
      <div className="birka-container blog-header-inner">
        <Link
          href={paths.dashboard.root}
          className="birka-brand blog-brand-link"
          aria-label="3D Бирка — в магазин"
        >
          <BrandLockup />
        </Link>
        <nav className="blog-nav" aria-label="Навигация по журналу">
          <span className="blog-nav-current">
            <BookOpen aria-hidden="true" />
            Журнал
          </span>
          <Link href={paths.dashboard.root} className="blog-nav-link">
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
    <footer className="blog-footer">
      <div className="birka-container blog-footer-inner">
        <div>
          <strong className="blog-footer-brand">
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
          <Link href={paths.dashboard.root} className="birka-footer-link">
            Каталог и конструктор
          </Link>
          <Link
            href={`${paths.dashboard.root}#faq`}
            className="birka-footer-link"
          >
            Частые вопросы
          </Link>
          <Link href={paths.legal.delivery} className="birka-footer-link">
            Оплата и доставка
          </Link>
          <ContactLink />
        </div>
        <div>
          <span>Документы</span>
          <Link href={paths.legal.offer} className="birka-footer-link">
            Публичная оферта
          </Link>
          <Link href={paths.legal.privacy} className="birka-footer-link">
            Политика конфиденциальности
          </Link>
          <Link href={paths.legal.consent} className="birka-footer-link">
            Согласие на обработку ПДн
          </Link>
        </div>
      </div>
      <div className="birka-container blog-footer-bottom">
        <span>
          © 2026 3D Бирка · {LEGAL_ENTITY.shortName}, ИНН {LEGAL_ENTITY.inn}
        </span>
        <span className="blog-footer-leaves" aria-hidden="true">
          <Leaf />
          <Leaf />
          <Leaf />
        </span>
      </div>
    </footer>
  );
}
