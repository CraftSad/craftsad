"use client";

import {
  ChevronDown,
  Leaf,
  Menu,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { ContactLink } from "./contact-link";
import { type Category, money } from "./shared";
import { RollingNumber } from "./ui";

export function SiteHeader({
  menuOpen,
  cartCount,
  cartTotal,
  onHome,
  onNavigate,
  onSelectCategory,
  onMenuToggle,
  onShowLogin,
  onShowCart,
}: {
  menuOpen: boolean;
  cartCount: number;
  cartTotal: number;
  onHome: () => void;
  onNavigate: (id: string) => void;
  onSelectCategory: (category: Category) => void;
  onMenuToggle: () => void;
  onShowLogin: () => void;
  onShowCart: () => void;
}) {
  return (
    <header className="birka-header">
      <div className="birka-header-inner">
        <button
          type="button"
          className="birka-brand"
          onClick={onHome}
          aria-label="3D Бирка — на главную"
        >
          <span className="birka-brand-mark">
            <Leaf />
          </span>
          <span>
            Craft<span>Sad</span>
            <small>мастерская садовых бирок</small>
          </span>
        </button>
        <nav
          className={menuOpen ? "birka-nav is-open" : "birka-nav"}
          aria-label="Главное меню"
        >
          <div className="birka-nav-dropdown">
            <button type="button" onClick={() => onNavigate("catalog")}>
              Каталог <ChevronDown />
            </button>
            <div className="birka-nav-menu">
              <button
                type="button"
                onClick={() => onSelectCategory("seedling")}
              >
                Бирки для рассады
              </button>
              <button type="button" onClick={() => onSelectCategory("garden")}>
                Бирки для грядок
              </button>
            </div>
          </div>
          <button type="button" onClick={() => onNavigate("constructor")}>
            Конструктор
          </button>
        </nav>
        <div className="birka-header-actions">
          <ContactLink compact />
          <button
            type="button"
            className="birka-login-button"
            aria-label="Войти"
            onClick={onShowLogin}
          >
            <UserRound />
            <span>Войти</span>
          </button>
          <button
            type="button"
            className="birka-cart-button"
            aria-label={`Корзина: ${cartCount} шт., ${money(cartTotal)} ₽`}
            onClick={onShowCart}
          >
            <ShoppingBag />
            <span>
              Корзина{" "}
              <small>
                <RollingNumber value={cartTotal} /> ₽
              </small>
            </span>
          </button>
          <button
            type="button"
            className="birka-menu-toggle birka-icon-button"
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
            onClick={onMenuToggle}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
