"use client";

import { paths } from "@acme/config";
import { ChevronDown, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "./brand";
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
  onEditor,
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
  /** Opens the 3D editor, carrying the current constructor setup along. */
  onEditor: () => void;
}) {
  return (
    <header className="fixed z-[40] [background:#fbf8f0ed] border-bottom-[1px] border-bottom-[#e6e2da] top-[22px] left-1/2 [transform:translateX(-50%)] w-[min(calc(100%_-_80px),1400px)] border border-solid border-[#ffffffb0] rounded-full [backdrop-filter:blur(22px)] shadow-[0_8px_40px_#273f2310] border-[#b5965c30] max-[1150px]:w-[calc(100%_-_48px)] max-[800px]:top-[14px] max-[800px]:w-[calc(100%_-_28px)]">
      <div className="w-full min-h-[76px] m-[auto] flex items-center justify-between gap-[24px] pt-[10px] pr-[16px] pb-[10px] pl-[28px] max-[1100px]:w-[min(100%_-_36px,1420px)] max-[1100px]:gap-[16px] max-[1150px]:pl-[20px] max-[370px]:px-[10px] max-[570px]:w-[calc(100%_-_24px)] max-[570px]:gap-[8px] max-[570px]:px-[14px] max-[800px]:min-h-[63px] max-[800px]:pt-[8px] max-[800px]:pr-[10px] max-[800px]:pb-[8px] max-[800px]:pl-[18px]">
        <button
          type="button"
          className="border-0 [background:none] inline-flex items-center gap-[12px] p-0 text-left text-forest font-display text-[33px] font-semibold leading-[.9] whitespace-nowrap tracking-[-.02em] max-[1100px]:text-[26px] max-[370px]:gap-[6px] max-[570px]:gap-[9px] max-[570px]:text-[26px] max-[800px]:text-[28px] [&_small]:block [&_small]:font-[500] [&_small]:text-[8px] [&_small]:leading-[1.4] [&_small]:font-craft [&_small]:tracking-[.17em] [&_small]:uppercase [&_small]:text-[#637064] [&_small]:mt-[9px] max-[1100px]:[&_small]:text-[9px] max-[570px]:[&_small]:hidden max-[570px]:[&_small]:text-[6px] max-[570px]:[&_small]:tracking-[.1em] [&>span:last-child]:text-ink [&>span:last-child]:font-semibold [&>span:last-child]:tracking-[-.02em] max-[370px]:[&_small]:tracking-[0]"
          onClick={onHome}
          aria-label="3D Бирка — на главную"
        >
          <BrandLockup />
        </button>
        <nav
          className={`flex items-center gap-[30px] max-[1100px]:gap-[20px] max-[1150px]:gap-[18px] max-[800px]:absolute max-[800px]:top-[73px] max-[800px]:left-0 max-[800px]:right-0 max-[800px]:[background:#fffef8f5] max-[800px]:p-[18px] max-[800px]:shadow-[0_12px_28px_#0002] max-[800px]:flex-col max-[800px]:items-stretch max-[800px]:gap-[0] max-[800px]:rounded-[22px] max-[800px]:[backdrop-filter:blur(25px)] [&_button]:border-0 [&_button]:[background:none] [&_button]:text-ink [&_button]:font-semibold [&_button]:whitespace-nowrap [&_button]:flex [&_button]:items-center [&_button]:gap-[6px] [&_button]:py-[16px] [&_button]:px-[0] [&_button]:text-[16px] [&_button:hover]:text-forest max-[1100px]:[&_button]:text-[16px] max-[800px]:[&>button]:w-full max-[800px]:[&>button]:justify-between max-[800px]:[&>button]:text-[18px] ${menuOpen ? "max-[800px]:flex" : "max-[800px]:hidden"}`}
          aria-label="Главное меню"
        >
          <div className="group relative max-[800px]:[&>button]:w-full max-[800px]:[&>button]:justify-between max-[800px]:[&>button]:text-[18px]">
            <button type="button" onClick={() => onNavigate("catalog")}>
              Каталог <ChevronDown />
            </button>
            <div className="absolute top-full left-[-20px] w-[270px] [background:#fffffff0] border border-solid border-[#ffffffa0] rounded-[20px] shadow-[0_15px_50px_#233c2318] p-[15px] hidden group-hover:block group-focus-within:block [backdrop-filter:blur(24px)] max-[800px]:static max-[800px]:block max-[800px]:shadow-none max-[800px]:w-full max-[800px]:[background:transparent] max-[800px]:ml-[4px] max-[800px]:border-0 [&_button]:block [&_button]:w-full [&_button]:text-left [&_button]:p-[11px] [&_button]:rounded-[8px] [&_button]:text-[16px] [&_span]:block [&_span]:w-full [&_span]:text-left [&_span]:p-[11px] [&_span]:rounded-[8px] [&_span]:text-[16px] [&_span]:text-hedge [&_button:hover]:[background:#f1f4ef]">
              <button
                type="button"
                onClick={() => onSelectCategory("collections")}
              >
                Авторские серии
              </button>
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
          <button
            type="button"
            title="Настроить бирку и распечатать на своём принтере"
            onClick={onEditor}
          >
            3D-редактор
          </button>
          <button type="button" onClick={() => onNavigate("faq")}>
            Вопросы
          </button>
          <Link
            href={paths.blog.root}
            className="flex items-center py-[16px] px-[0] text-ink text-[15px] font-semibold whitespace-nowrap no-underline [transition:color_0.2s] hover:text-forest max-[800px]:w-full max-[800px]:justify-between max-[800px]:text-[18px]"
          >
            Журнал
          </Link>
        </nav>
        <div className="flex items-center gap-[24px] max-[1100px]:gap-[16px] max-[1150px]:gap-[14px] max-[370px]:gap-[2px] max-[570px]:gap-[6px] max-[800px]:gap-[6px]">
          <ContactLink compact />
          <button
            type="button"
            className="border-0 [background:none] text-ink font-medium whitespace-nowrap flex items-center gap-[8px] text-[15px] hover:text-forest max-[800px]:w-[38px] max-[800px]:h-[44px] max-[800px]:justify-center [&_svg]:w-[18px] [&_svg]:h-[21px] max-[800px]:[&_span]:hidden"
            aria-label="Войти"
            onClick={onShowLogin}
          >
            <UserRound />
            <span>Войти</span>
          </button>
          <button
            type="button"
            className="border-0 [background:#23483e] text-[white] font-bold whitespace-nowrap flex items-center gap-[10px] rounded-full py-[10px] px-[20px] min-h-[52px] text-left text-[14px] hover:[background:#15372e] max-[800px]:min-h-[44px] max-[800px]:w-[44px] max-[800px]:rounded-full max-[800px]:p-0 max-[800px]:justify-center max-[800px]:h-[44px] [&_svg]:w-[21px] [&_svg]:h-[21px] [&_small]:flex [&_small]:text-[14px] [&_small]:font-normal [&_small]:text-[white] [&_small]:pl-[12px] [&_small]:border-left-[1px] [&_small]:border-left-[#ffffff35] [&_small]:whitespace-nowrap [&_small]:gap-[4px] [&_small]:items-center max-[800px]:[&_span]:hidden [&_span]:flex [&_span]:gap-[11px] [&_span]:items-center"
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
            className="hidden max-[800px]:grid w-[44px] h-[44px] grid place-items-center border border-solid border-linen [background:white] rounded-full text-ink max-[800px]:[background:#ffffff75] max-[800px]:border-0 [&_svg]:w-[21px] [&_svg]:h-[21px]"
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
