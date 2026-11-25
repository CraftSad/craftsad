"use client";

import { paths } from "@acme/config";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { LEGAL_ENTITY } from "~/components/legal/legal-data";

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
            <i className="birka-footer-mark" aria-hidden="true">
              <Leaf />
            </i>
            3D <em>Бирка</em>
          </strong>
          <p>
            Мастерская садовых бирок.
            <br />
            Сделано с любовью к вашим растениям.
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
          <Link href={paths.legal.delivery} className="birka-footer-link">
            Оплата, доставка и возврат
          </Link>
        </div>
        <div>
          <span>Помощь и документы</span>
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
        <span>Пусть всё растёт 🌱</span>
      </div>
    </footer>
  );
}
