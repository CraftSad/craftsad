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
    <footer className="birka-footer">
      <div className="birka-container">
        <div>
          <strong className="birka-footer-brand">
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
          <Link href={paths.blog.root} className="birka-footer-link">
            Журнал мастерской
          </Link>
          <Link href={paths.legal.delivery} className="birka-footer-link">
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
          <Link href={paths.legal.offer} className="birka-footer-link">
            Публичная оферта
          </Link>
          <Link href={paths.legal.privacy} className="birka-footer-link">
            Политика конфиденциальности
          </Link>
          <Link href={paths.legal.consent} className="birka-footer-link">
            Согласие на обработку ПДн
          </Link>
          <Link href={paths.legal.cookies} className="birka-footer-link">
            Файлы cookie
          </Link>
        </div>
      </div>
      <div className="birka-footer-bottom birka-container">
        <span>
          © {year} 3D Бирка · {LEGAL_ENTITY.shortName}, ИНН {LEGAL_ENTITY.inn}
        </span>
        <span>Сад начинается с имени.</span>
      </div>
    </footer>
  );
}
