"use client";

import { Leaf } from "lucide-react";
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
            <i className="birka-footer-mark" aria-hidden="true">
              <Leaf />
            </i>
            Craft<em>Sad</em>
          </strong>
          <p>
            Мастерская садовых бирок 3dbirka.
            <br />
            Сделано с любовью к вашим растениям.
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
        </div>
        <div>
          <span>Помощь</span>
          <ContactLink />
          <p>
            Доставка в пункты Ozon
            <br />
            по всей России
          </p>
          <button type="button" onClick={onShowLogin}>
            Личный кабинет
          </button>
        </div>
      </div>
      <div className="birka-footer-bottom birka-container">
        <span>© {year} CraftSad</span>
        <span>Пусть всё растёт 🌱</span>
      </div>
    </footer>
  );
}
