"use client";

import { loginFormSchema } from "@acme/validators";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Leaf,
  Mail,
  Menu,
  PackageCheck,
  Phone,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import {
  colorPairs,
  popularVarieties,
  presets,
  type ShapeId,
  shapes,
} from "./data";

type CartItem = {
  id: number;
  shape: ShapeId;
  color: number;
  names: string[];
  price: number;
};
type View = "front" | "side" | "rotate";
const money = (value: number) => new Intl.NumberFormat("ru-RU").format(value);
const localPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && /^[78]/.test(digits)
    ? digits.slice(1)
    : digits;
};
const formatPhone = (value: string) => {
  const local = localPhone(value);
  return `+7 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 8)}-${local.slice(8)}`;
};
const phoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^\+?[\d ().-]+$/.test(value) && localPhone(value).length === 10,
    "Введите номер телефона полностью",
  );
const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Введите имя"),
  phone: phoneSchema,
  city: z.string().trim().min(1, "Введите город"),
  address: z.string().trim().min(1, "Введите адрес пункта выдачи"),
});
const scrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
const labelCounts = new Intl.PluralRules("ru-RU");
const labelForms = { one: "бирка", few: "бирки", many: "бирок" };
const accountTabs = [
  { id: "orders", title: "Мои заказы" },
  { id: "lists", title: "Мои списки сортов" },
  { id: "help", title: "Помощь мастера" },
] as const;

function StorefrontDialog({
  children,
  drawer = false,
  titleId,
  onClose,
}: {
  children: ReactNode;
  drawer?: boolean;
  titleId: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const opener = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={drawer ? "cs-overlay cs-drawer-overlay" : "cs-overlay"}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button:enabled, input:enabled, [tabindex='0']",
          ),
        ).filter(
          (control) => control.tabIndex >= 0 && control.getClientRects().length,
        );
        const first = controls.at(0);
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <button
        type="button"
        className="cs-backdrop"
        tabIndex={-1}
        aria-label="Закрыть окно"
        onClick={onClose}
      />
      <div className={drawer ? "cs-drawer" : "cs-modal"}>{children}</div>
    </dialog>
  );
}

function LabelPreview({
  shape,
  color,
  name,
  view = "front",
  small = false,
}: {
  shape: ShapeId;
  color: number;
  name: string;
  view?: View;
  small?: boolean;
}) {
  const pair = colorPairs[color] ?? colorPairs[0];
  return (
    <div
      className={`cs-preview ${small ? "cs-preview-small" : ""} cs-preview-${view}`}
      role="img"
      aria-label={`Бирка: ${name || "ваша надпись"}`}
    >
      <div
        className={`cs-label cs-label-${shape}`}
        style={
          {
            "--label-base": pair.base,
            "--label-ink": pair.ink,
          } as CSSProperties
        }
      >
        {shape === "hanging" && <span className="cs-label-hole" />}
        <span className="cs-label-text">{name || "Ваш сорт"}</span>
        {shape !== "hanging" && <span className="cs-label-stem" />}
      </div>
      {!small && <div className="cs-preview-shadow" />}
    </div>
  );
}

function LoginModal({
  onClose,
  savedNames,
  onRepeat,
  done,
  onLogin,
}: {
  onClose: () => void;
  savedNames: string[];
  onRepeat: () => void;
  done: boolean;
  onLogin: () => void;
}) {
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(59);
  const [accountTab, setAccountTab] = useState<"orders" | "lists" | "help">(
    "orders",
  );
  const [error, setError] = useState("");
  const contactInput = useRef<HTMLInputElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const accountHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (done) accountHeading.current?.focus();
    else if (sent) codeInput.current?.focus();
    else contactInput.current?.focus();
  }, [done, sent]);
  useEffect(() => {
    if (!sent || seconds === 0) return;
    const timer = window.setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [sent, seconds]);
  const submitContact = (event: FormEvent) => {
    event.preventDefault();
    const result =
      method === "email"
        ? loginFormSchema.safeParse({ email: contact.trim() })
        : phoneSchema.safeParse(contact);
    if (!result.success) {
      setError(
        result.error.issues[0]?.message ?? "Проверьте контактные данные",
      );
      return;
    }
    setContact(method === "phone" ? formatPhone(contact) : contact.trim());
    setError("");
    setSent(true);
    setSeconds(59);
  };
  return (
    <StorefrontDialog titleId="login-title" onClose={onClose}>
      <button
        type="button"
        className="cs-icon-button cs-close"
        aria-label="Закрыть"
        onClick={onClose}
      >
        <X />
      </button>
      {done ? (
        <div className="cs-account">
          <span className="cs-eyebrow">Личный кабинет</span>
          <h2 id="login-title" ref={accountHeading} tabIndex={-1}>
            Вы вошли
          </h2>
          <p>Ваши заказы и названия сортов — в одном месте.</p>
          <div
            className="cs-account-tabs"
            role="tablist"
            aria-label="Разделы личного кабинета"
          >
            {accountTabs.map(({ id, title }, index) => (
              <button
                key={id}
                id={`cs-tab-${id}`}
                type="button"
                role="tab"
                tabIndex={accountTab === id ? 0 : -1}
                aria-controls={`cs-panel-${id}`}
                aria-selected={accountTab === id}
                className={accountTab === id ? "active" : ""}
                onClick={() => setAccountTab(id)}
                onKeyDown={(event) => {
                  const offset =
                    event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  if (!offset) return;
                  event.preventDefault();
                  const next = accountTabs.at(
                    (index + offset) % accountTabs.length,
                  );
                  if (!next) return;
                  setAccountTab(next.id);
                  document.getElementById(`cs-tab-${next.id}`)?.focus();
                }}
              >
                {title}
              </button>
            ))}
          </div>
          <div
            className="cs-account-panel"
            id="cs-panel-orders"
            role="tabpanel"
            aria-labelledby="cs-tab-orders"
            hidden={accountTab !== "orders"}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: The panel starts with text that keyboard users need to reach.
            tabIndex={0}
          >
            <strong>Заказ № 1042</strong>
            <p>
              Статус: <b>Печатаем</b>
            </p>
            <div className="cs-order-progress">
              <span className="active">Печатаем</span>
              <span>Передано в Ozon</span>
              <span>Готово к выдаче</span>
            </div>
            <p>
              Трек-номер Ozon: <b>CS-1042-2026</b>
            </p>
            <button
              type="button"
              className="cs-text-button"
              onClick={() => navigator.clipboard?.writeText("CS-1042-2026")}
            >
              <Copy /> Скопировать номер
            </button>
            <small>Это пример заказа для демонстрации.</small>
          </div>
          <div
            className="cs-account-panel"
            id="cs-panel-lists"
            role="tabpanel"
            aria-labelledby="cs-tab-lists"
            hidden={accountTab !== "lists"}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: The panel starts with text that keyboard users need to reach.
            tabIndex={0}
          >
            <strong>Текущий список сортов</strong>
            <p>
              {savedNames.length
                ? savedNames.slice(0, 5).join(", ")
                : "Пока нет сохранённых названий"}
              {savedNames.length > 5 ? " и другие" : ""}
            </p>
            <button
              type="button"
              className="cs-button cs-button-primary"
              onClick={onRepeat}
            >
              Заказать такие же снова <ArrowRight />
            </button>
          </div>
          <div
            className="cs-account-panel"
            id="cs-panel-help"
            role="tabpanel"
            aria-labelledby="cs-tab-help"
            hidden={accountTab !== "help"}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: The panel starts with text that keyboard users need to reach.
            tabIndex={0}
          >
            <strong>Помощь мастера</strong>
            <p>Если понадобится помощь с выбором бирок, мы подскажем.</p>
            <button type="button" disabled className="cs-help-button">
              <Phone /> Позвонить
            </button>
            <button type="button" disabled className="cs-help-button">
              <Send /> Написать в Telegram
            </button>
            <small>Контакты появятся при запуске магазина.</small>
          </div>
        </div>
      ) : (
        <>
          <span className="cs-eyebrow">Личный кабинет</span>
          <h2 id="login-title">
            {sent ? "Введите код" : "Войдите без пароля"}
          </h2>
          <p className="cs-modal-lead">
            {sent
              ? `Код для входа на ${contact}. В этой демонстрации используйте 123456.`
              : "Выберите удобный способ. Пароль запоминать не нужно."}
          </p>
          {!sent ? (
            <>
              <fieldset className="cs-segmented" aria-label="Способ входа">
                <button
                  type="button"
                  className={method === "phone" ? "active" : ""}
                  onClick={() => {
                    setMethod("phone");
                    setContact("");
                    setError("");
                  }}
                >
                  <Phone /> По телефону
                </button>
                <button
                  type="button"
                  className={method === "email" ? "active" : ""}
                  onClick={() => {
                    setMethod("email");
                    setContact("");
                    setError("");
                  }}
                >
                  <Mail /> По эл. почте
                </button>
              </fieldset>
              <form onSubmit={submitContact} className="cs-form" noValidate>
                <label htmlFor="login-contact">
                  {method === "phone" ? "Номер телефона" : "Электронная почта"}
                </label>
                <input
                  ref={contactInput}
                  id="login-contact"
                  type={method === "phone" ? "tel" : "email"}
                  inputMode={method === "phone" ? "tel" : "email"}
                  autoComplete={method === "phone" ? "tel" : "email"}
                  placeholder={
                    method === "phone"
                      ? "+7 (999) 123-45-67"
                      : "example@mail.ru"
                  }
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-contact-error" : undefined}
                />
                {error && (
                  <p id="login-contact-error" className="cs-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="cs-button cs-button-primary" type="submit">
                  Получить код <ArrowRight />
                </button>
              </form>
            </>
          ) : (
            <form
              className="cs-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (code === "123456") {
                  onLogin();
                  setError("");
                } else setError("Проверьте код. Для демонстрации: 123456");
              }}
            >
              <label htmlFor="login-code">Код из 6 цифр</label>
              <input
                ref={codeInput}
                id="login-code"
                className="cs-code-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="· · · · · ·"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              {error && (
                <p className="cs-error" role="alert">
                  {error}
                </p>
              )}
              <button className="cs-button cs-button-primary" type="submit">
                Войти <ArrowRight />
              </button>
              <button
                type="button"
                className="cs-text-button"
                disabled={seconds > 0}
                onClick={() => {
                  setSeconds(59);
                  setCode("");
                }}
              >
                {seconds > 0
                  ? `Отправить снова через ${seconds} сек.`
                  : "Отправить код снова"}
              </button>
              <button
                type="button"
                className="cs-text-button"
                onClick={() => {
                  setSent(false);
                  setCode("");
                  setError("");
                }}
              >
                Изменить номер или почту
              </button>
            </form>
          )}
        </>
      )}
    </StorefrontDialog>
  );
}

function CartDrawer({
  items,
  onClose,
  onRemove,
}: {
  items: CartItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
}) {
  const [checkout, setCheckout] = useState(false);
  const [delivery, setDelivery] = useState<"list" | "map">("list");
  const [demoComplete, setDemoComplete] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof checkoutSchema>, string>>
  >({});
  const nameInput = useRef<HTMLInputElement>(null);
  const completion = useRef<HTMLHeadingElement>(null);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  useEffect(() => {
    if (demoComplete) completion.current?.focus();
    else if (checkout) nameInput.current?.focus();
  }, [checkout, demoComplete]);
  const submitCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const result = checkoutSchema.safeParse({
      name: fields.get("name"),
      phone: fields.get("phone"),
      city: fields.get("city"),
      address: fields.get("address"),
    });
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
        city: fieldErrors.city?.[0],
        address: fieldErrors.address?.[0],
      });
      return;
    }
    setErrors({});
    setDemoComplete(true);
  };
  return (
    <StorefrontDialog titleId="cart-title" onClose={onClose} drawer>
      <div className="cs-drawer-head">
        <div>
          <span className="cs-eyebrow">Ваш заказ</span>
          <h2 id="cart-title">
            {demoComplete
              ? "Результат оформления"
              : checkout
                ? "Оформление"
                : "Корзина"}
          </h2>
        </div>
        <button
          type="button"
          className="cs-icon-button"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <X />
        </button>
      </div>
      {demoComplete ? (
        <div className="cs-empty">
          <PackageCheck />
          <h3 ref={completion} tabIndex={-1}>
            Демонстрация завершена
          </h3>
          <p>Заказ не создан. Данные не сохранены и не отправлены.</p>
          <button
            type="button"
            className="cs-button cs-button-primary"
            onClick={onClose}
          >
            Вернуться в магазин
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="cs-empty">
          <ShoppingBag />
          <h3>Пока пусто</h3>
          <p>Добавьте бирки со своими названиями — они появятся здесь.</p>
          <button
            type="button"
            className="cs-button cs-button-primary"
            onClick={onClose}
          >
            Выбрать бирки
          </button>
        </div>
      ) : (
        <>
          <div className="cs-delivery-note">
            <Truck />
            <span>
              Доставка в пункт выдачи Ozon по всей России — обычно 2–4 дня
            </span>
          </div>
          <div className="cs-cart-items">
            {items.map((item) => (
              <article className="cs-cart-item" key={item.id}>
                <LabelPreview
                  shape={item.shape}
                  color={item.color}
                  name={item.names[0] ?? ""}
                  small
                />
                <div>
                  <strong>
                    {shapes.find((shape) => shape.id === item.shape)?.title}
                  </strong>
                  <p>
                    {item.names.length} шт. ·{" "}
                    {(colorPairs[item.color] ?? colorPairs[0]).name}
                  </p>
                  <b>{money(item.price)} ₽</b>
                  <button
                    type="button"
                    className="cs-text-button"
                    onClick={() => onRemove(item.id)}
                  >
                    Убрать
                  </button>
                </div>
              </article>
            ))}
          </div>
          {checkout && (
            <form
              id="cs-checkout"
              className="cs-form cs-checkout"
              noValidate
              onSubmit={submitCheckout}
            >
              <p className="cs-helper">
                Это демонстрация оформления. Введённые данные не сохраняются и
                не отправляются. Можно использовать вымышленные данные.
              </p>
              <label htmlFor="customer-name">Имя</label>
              <input
                ref={nameInput}
                id="customer-name"
                name="name"
                autoComplete="name"
                required
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "checkout-name-error" : undefined
                }
                placeholder="Как к вам обращаться"
              />
              {errors.name && (
                <p id="checkout-name-error" className="cs-error" role="alert">
                  {errors.name}
                </p>
              )}
              <label htmlFor="customer-phone">Телефон</label>
              <input
                id="customer-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                aria-invalid={!!errors.phone}
                aria-describedby={
                  errors.phone ? "checkout-phone-error" : undefined
                }
                placeholder="+7 (999) 123-45-67"
              />
              {errors.phone && (
                <p id="checkout-phone-error" className="cs-error" role="alert">
                  {errors.phone}
                </p>
              )}
              <label htmlFor="customer-city">Город</label>
              <input
                id="customer-city"
                name="city"
                required
                placeholder="Ваш город"
                aria-invalid={!!errors.city}
                aria-describedby={
                  errors.city ? "checkout-city-error" : undefined
                }
              />
              {errors.city && (
                <p id="checkout-city-error" className="cs-error" role="alert">
                  {errors.city}
                </p>
              )}
              <fieldset
                className="cs-segmented"
                aria-label="Способ выбора пункта выдачи"
              >
                <button
                  type="button"
                  className={delivery === "list" ? "active" : ""}
                  onClick={() => setDelivery("list")}
                >
                  Из списка
                </button>
                <button
                  type="button"
                  className={delivery === "map" ? "active" : ""}
                  onClick={() => setDelivery("map")}
                >
                  На карте
                </button>
              </fieldset>
              <label htmlFor="ozon-address">Адрес удобного пункта Ozon</label>
              <input
                id="ozon-address"
                name="address"
                aria-invalid={!!errors.address}
                aria-describedby={
                  errors.address ? "checkout-address-error" : undefined
                }
                required
                placeholder={
                  delivery === "map"
                    ? "Напишите адрес пункта с карты Ozon"
                    : "Улица и номер пункта выдачи"
                }
              />
              {errors.address && (
                <p
                  id="checkout-address-error"
                  className="cs-error"
                  role="alert"
                >
                  {errors.address}
                </p>
              )}
              <p className="cs-helper">
                Выбор на карте станет доступен после подключения службы
                доставки.
              </p>
            </form>
          )}
          <div className="cs-cart-footer">
            <div className="cs-total">
              <span>Итого</span>
              <strong>{money(total)} ₽</strong>
            </div>
            <button
              className="cs-button cs-button-primary"
              type={checkout ? "submit" : "button"}
              form={checkout ? "cs-checkout" : undefined}
              onClick={checkout ? undefined : () => setCheckout(true)}
            >
              {checkout ? "Завершить демонстрацию" : "Оформить заказ"}
              <ArrowRight />
            </button>
            {checkout && (
              <button
                type="button"
                className="cs-text-button"
                onClick={() => {
                  setErrors({});
                  setCheckout(false);
                }}
              >
                Вернуться в корзину
              </button>
            )}
          </div>
        </>
      )}
    </StorefrontDialog>
  );
}

export function Storefront() {
  const [category, setCategory] = useState<"all" | "seedling" | "garden">(
    "all",
  );
  const [shape, setShape] = useState<ShapeId>("stake");
  const [color, setColor] = useState(0);
  const [namesText, setNamesText] = useState(
    "Томат Бычье сердце\nОгурец Зозуля\nПерец Калифорнийское чудо",
  );
  const [view, setView] = useState<View>("front");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [dialog, setDialog] = useState<"login" | "cart" | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [added, setAdded] = useState(false);
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  const names = namesText
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean);
  const chosenShape = shapes.find((entry) => entry.id === shape) ?? shapes[0];
  const price = names.length * chosenShape.price;
  const countForm = labelCounts.select(names.length);
  const cartCount = cart.reduce((sum, item) => sum + item.names.length, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() });
    setMenuOpen(false);
  };
  const applyPreset = (preset: (typeof presets)[number]) => {
    setShape(preset.shape);
    setColor(preset.color);
    setNamesText(preset.names.join("\n"));
    setPreviewIndex(0);
    setAdded(false);
    scrollTo("constructor");
  };
  const addToCart = () => {
    if (!names.length) {
      document.getElementById("varieties")?.focus();
      return;
    }
    setCart((prev) => [
      ...prev,
      { id: Date.now(), shape, color, names: [...names], price },
    ]);
    setAdded(true);
    setDialog("cart");
  };
  return (
    <div className="cs-site">
      <header className="cs-header">
        <div className="cs-header-inner">
          <button
            type="button"
            className="cs-brand"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: scrollBehavior() })
            }
            aria-label="CraftSad — на главную"
          >
            <span className="cs-brand-mark">
              <Leaf />
            </span>
            <span>
              Craft<span>Sad</span>
              <small>мастерская садовых бирок</small>
            </span>
          </button>
          <nav
            className={menuOpen ? "cs-nav is-open" : "cs-nav"}
            aria-label="Главное меню"
          >
            <div className="cs-nav-dropdown">
              <button type="button" onClick={() => scrollTo("catalog")}>
                Каталог <ChevronDown />
              </button>
              <div className="cs-nav-menu">
                <button
                  type="button"
                  onClick={() => {
                    setCategory("seedling");
                    scrollTo("catalog");
                  }}
                >
                  Бирки для рассады
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("garden");
                    scrollTo("catalog");
                  }}
                >
                  Бирки для грядок
                </button>
                <span>Скоро: опоры и кашпо</span>
              </div>
            </div>
            <button type="button" onClick={() => scrollTo("constructor")}>
              Создать свою бирку
            </button>
          </nav>
          <div className="cs-header-actions">
            <button
              type="button"
              className="cs-login-button"
              aria-label="Войти"
              onClick={() => setDialog("login")}
            >
              <UserRound />
              <span>Войти</span>
            </button>
            <button
              type="button"
              className="cs-cart-button"
              aria-label={`Корзина: ${cartCount} шт., ${money(cartTotal)} ₽`}
              onClick={() => setDialog("cart")}
            >
              <ShoppingBag />
              <span>
                Корзина{" "}
                <small>
                  {cartCount} шт. · {money(cartTotal)} ₽
                </small>
              </span>
            </button>
            <button
              type="button"
              className="cs-menu-toggle cs-icon-button"
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main>
        <section className="cs-hero">
          <div className="cs-hero-image" />
          <div className="cs-hero-shade" />
          <div className="cs-container cs-hero-content">
            <span className="cs-hero-kicker">
              <span /> Вещи, которые растут вместе с садом
            </span>
            <h1>
              Вечные садовые бирки
              <br /> с названиями
              <br /> <em>ваших сортов</em>
            </h1>
            <p>
              Прочные бирки с вашими надписями. Не боятся дождя и солнца,
              помогают сохранить каждый сорт. Доставим в пункт Ozon рядом с
              домом.
            </p>
            <div className="cs-hero-actions">
              <button
                type="button"
                className="cs-button cs-button-primary"
                onClick={() => scrollTo("constructor")}
              >
                Собрать свой набор <ArrowRight />
              </button>
              <button
                type="button"
                className="cs-button cs-button-light"
                onClick={() => scrollTo("catalog")}
              >
                Готовые наборы
              </button>
            </div>
            <div className="cs-hero-bottom">
              <span>
                <ShieldCheck /> Сделано для сада и теплицы
              </span>
              <span>
                <Truck /> Доставка по всей России
              </span>
            </div>
          </div>
          <button
            type="button"
            className="cs-scroll-hint"
            onClick={() => scrollTo("how")}
          >
            Листайте вниз <ArrowDown />
          </button>
        </section>
        <section id="how" className="cs-section cs-how">
          <div className="cs-container">
            <div className="cs-section-top">
              <div>
                <span className="cs-eyebrow">Всё просто</span>
                <h2>
                  От названия сорта
                  <br />
                  до готовой бирки
                </h2>
              </div>
              <p>
                Всего три шага — и на грядках будет порядок, который радует
                глаз.
              </p>
            </div>
            <div className="cs-steps">
              <article>
                <span className="cs-step-number">01</span>
                <div className="cs-step-icon">
                  <Sparkles />
                </div>
                <h3>
                  Выберите форму
                  <br />и впишите сорта
                </h3>
                <p>
                  Каждое название — на отдельной бирке. Цвет тоже можно выбрать.
                </p>
              </article>
              <article>
                <span className="cs-step-number">02</span>
                <div className="cs-step-icon">
                  <Leaf />
                </div>
                <h3>
                  Мы напечатаем
                  <br />
                  за 2 дня
                </h3>
                <p>Из прочного пластика, с аккуратными объёмными буквами.</p>
              </article>
              <article>
                <span className="cs-step-number">03</span>
                <div className="cs-step-icon">
                  <PackageCheck />
                </div>
                <h3>
                  Заберите в Ozon
                  <br />
                  рядом с домом
                </h3>
                <p>Выберите удобный пункт выдачи в своём городе.</p>
              </article>
            </div>
          </div>
        </section>
        <section id="catalog" className="cs-section cs-catalog">
          <div className="cs-container">
            <div className="cs-section-top">
              <div>
                <span className="cs-eyebrow">Для каждого сезона</span>
                <h2>Готовые наборы</h2>
              </div>
              <p>
                Подобрали удобные наборы для рассады, грядок и теплицы. Любую
                надпись можно изменить.
              </p>
            </div>
            <fieldset className="cs-filters" aria-label="Категории">
              <button
                type="button"
                className={category === "all" ? "active" : ""}
                onClick={() => setCategory("all")}
              >
                Все наборы
              </button>
              <button
                type="button"
                className={category === "seedling" ? "active" : ""}
                onClick={() => setCategory("seedling")}
              >
                Для рассады
              </button>
              <button
                type="button"
                className={category === "garden" ? "active" : ""}
                onClick={() => setCategory("garden")}
              >
                Для грядок
              </button>
            </fieldset>
            <div className="cs-products">
              {presets
                .filter(
                  (preset) =>
                    category === "all" || preset.category === category,
                )
                .map((preset, index) => (
                  <article className="cs-product" key={preset.title}>
                    <div className={`cs-product-art cs-art-${index % 3}`}>
                      <span className="cs-product-badge">
                        {preset.count} бирок
                      </span>
                      <LabelPreview
                        shape={preset.shape}
                        color={preset.color}
                        name={preset.names[0] ?? ""}
                        small
                      />
                    </div>
                    <div className="cs-product-body">
                      <span className="cs-product-category">
                        {preset.category === "seedling"
                          ? "Для рассады"
                          : "Для грядок"}{" "}
                        ·{" "}
                        {shapes.find((item) => item.id === preset.shape)?.size}
                      </span>
                      <h3>{preset.title}</h3>
                      <p>
                        {preset.names.slice(0, 3).join(", ")}
                        {preset.names.length > 3 ? " и другие" : ""}
                      </p>
                      <div className="cs-product-footer">
                        <strong>{money(preset.price)} ₽</strong>
                        <button
                          type="button"
                          onClick={() => applyPreset(preset)}
                        >
                          Настроить надпись <ArrowRight />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>
        <section id="constructor" className="cs-section cs-constructor">
          <div className="cs-container">
            <div className="cs-section-top">
              <div>
                <span className="cs-eyebrow">Сделайте по-своему</span>
                <h2>Бирки с вашими названиями</h2>
              </div>
              <p>Вы выбираете — мы покажем, как будет выглядеть ваша бирка.</p>
            </div>
            <div className="cs-builder">
              <div className="cs-builder-left">
                <div className="cs-builder-preview">
                  <div className="cs-preview-top">
                    <span>
                      <span className="cs-live-dot" /> Как будет выглядеть бирка
                    </span>
                    <span>
                      {Math.min(previewIndex + 1, Math.max(names.length, 1))} из{" "}
                      {Math.max(names.length, 1)}
                    </span>
                  </div>
                  <LabelPreview
                    shape={shape}
                    color={color}
                    name={
                      names[previewIndex % Math.max(names.length, 1)] ??
                      "Ваш сорт"
                    }
                    view={view}
                  />
                  <div className="cs-preview-pager">
                    <button
                      type="button"
                      aria-label="Предыдущая надпись"
                      onClick={() =>
                        setPreviewIndex(
                          (current) =>
                            (current - 1 + Math.max(names.length, 1)) %
                            Math.max(names.length, 1),
                        )
                      }
                    >
                      <ChevronLeft />
                    </button>
                    <span aria-live="polite">
                      {names[previewIndex % Math.max(names.length, 1)] ||
                        "Ваша надпись"}
                    </span>
                    <button
                      type="button"
                      aria-label="Следующая надпись"
                      onClick={() =>
                        setPreviewIndex(
                          (current) =>
                            (current + 1) % Math.max(names.length, 1),
                        )
                      }
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </div>
                <fieldset
                  className="cs-view-controls"
                  aria-label="Ракурс бирки"
                >
                  <button
                    type="button"
                    className={view === "front" ? "active" : ""}
                    onClick={() => setView("front")}
                  >
                    Спереди
                  </button>
                  <button
                    type="button"
                    className={view === "side" ? "active" : ""}
                    onClick={() => setView("side")}
                  >
                    Сбоку
                  </button>
                  <button
                    type="button"
                    className={view === "rotate" ? "active" : ""}
                    onClick={() => setView("rotate")}
                  >
                    <RotateCcw /> Покрутить
                  </button>
                </fieldset>
                <p className="cs-preview-note">
                  Изображение помогает представить изделие. Готовая бирка может
                  немного отличаться.
                </p>
              </div>
              <div className="cs-builder-right">
                <div className="cs-builder-step">
                  <div className="cs-builder-heading">
                    <span>1</span>
                    <div>
                      <h3>Выберите форму и размер</h3>
                      <p>Для стаканчиков, грядок или теплицы</p>
                    </div>
                  </div>
                  <div className="cs-shapes">
                    {shapes.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={
                          shape === item.id ? "cs-shape active" : "cs-shape"
                        }
                        aria-pressed={shape === item.id}
                        onClick={() => {
                          setShape(item.id);
                          setAdded(false);
                        }}
                      >
                        <span
                          className={`cs-shape-icon cs-shape-icon-${item.id}`}
                        >
                          <i />
                        </span>
                        <span>
                          <strong>{item.title}</strong>
                          <small>
                            {item.size} · {item.price} ₽ за штуку
                          </small>
                        </span>
                        {shape === item.id && <Check />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cs-builder-step">
                  <div className="cs-builder-heading">
                    <span>2</span>
                    <div>
                      <h3>Выберите цвет бирки и букв</h3>
                      <p>Шесть сочетаний, которые хорошо читаются</p>
                    </div>
                  </div>
                  <div className="cs-colors">
                    {colorPairs.map((pair, index) => (
                      <button
                        type="button"
                        key={pair.name}
                        className={
                          color === index ? "cs-color active" : "cs-color"
                        }
                        aria-pressed={color === index}
                        onClick={() => {
                          setColor(index);
                          setAdded(false);
                        }}
                      >
                        <span
                          className="cs-color-swatch"
                          style={{ background: pair.base, color: pair.ink }}
                        >
                          Аа
                        </span>
                        <span>
                          <strong>{pair.name}</strong>
                          <small>{pair.label}</small>
                        </span>
                        {color === index && <Check />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cs-builder-step">
                  <div className="cs-builder-heading">
                    <span>3</span>
                    <div>
                      <h3>Впишите названия сортов</h3>
                      <p>Одно название — одна бирка</p>
                    </div>
                  </div>
                  <label htmlFor="varieties" className="cs-field-label">
                    Названия сортов, каждое с новой строки
                  </label>
                  <textarea
                    id="varieties"
                    rows={5}
                    value={namesText}
                    onChange={(event) => {
                      setNamesText(event.target.value);
                      setPreviewIndex(0);
                      setAdded(false);
                    }}
                    placeholder={
                      "Томат Бычье сердце\nОгурец Зозуля\nПерец Сладкий"
                    }
                  />
                  <div className="cs-variety-help">
                    <span>Можно добавить популярные сорта:</span>
                    <div>
                      {popularVarieties.map((name) => (
                        <button
                          type="button"
                          key={name}
                          onClick={() => {
                            if (!names.includes(name))
                              setNamesText(
                                (text) =>
                                  `${text.trim()}${text.trim() ? "\n" : ""}${name}`,
                              );
                            setAdded(false);
                          }}
                        >
                          <Plus /> {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="cs-builder-step cs-builder-final">
                  <div className="cs-builder-heading">
                    <span>4</span>
                    <div>
                      <h3>Ваш набор готов</h3>
                      <p>Проверьте количество и стоимость</p>
                    </div>
                  </div>
                  <div className="cs-summary">
                    <span>
                      {names.length}{" "}
                      {countForm === "one" || countForm === "few"
                        ? labelForms[countForm]
                        : labelForms.many}{" "}
                      · {chosenShape.size}
                    </span>
                    <strong>{money(price)} ₽</strong>
                  </div>
                  <button
                    type="button"
                    className="cs-button cs-button-primary"
                    disabled={!names.length}
                    onClick={addToCart}
                  >
                    {added ? "Добавить ещё один набор" : "Добавить в корзину"}
                    <ShoppingBag />
                  </button>
                  <p className="cs-helper">
                    Оплатить можно будет после подтверждения заказа.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="cs-promise">
          <div className="cs-container">
            <div>
              <span className="cs-eyebrow">С заботой о вашем саде</span>
              <h2>
                Чтобы помнить каждый сорт
                <br />и радоваться каждому ростку
              </h2>
            </div>
            <button
              type="button"
              className="cs-button cs-button-light"
              onClick={() => scrollTo("constructor")}
            >
              Создать свои бирки <ArrowRight />
            </button>
          </div>
        </section>
      </main>
      <footer className="cs-footer">
        <div className="cs-container">
          <div>
            <strong>CraftSad</strong>
            <p>
              Мастерская садовых бирок.
              <br />
              Сделано с любовью к вашим растениям.
            </p>
          </div>
          <div>
            <span>Магазин</span>
            <button type="button" onClick={() => scrollTo("catalog")}>
              Готовые наборы
            </button>
            <button type="button" onClick={() => scrollTo("constructor")}>
              Создать свои бирки
            </button>
          </div>
          <div>
            <span>Помощь</span>
            <p>
              Доставка в пункты Ozon
              <br />
              по всей России
            </p>
            <button type="button" onClick={() => setDialog("login")}>
              Личный кабинет
            </button>
          </div>
        </div>
        <div className="cs-footer-bottom cs-container">
          <span>© {year} CraftSad</span>
          <span>Пусть всё растёт 🌱</span>
        </div>
      </footer>
      {dialog === "login" && (
        <LoginModal
          onClose={() => setDialog(null)}
          done={loggedIn}
          onLogin={() => setLoggedIn(true)}
          savedNames={names}
          onRepeat={() => {
            setDialog(null);
            scrollTo("constructor");
          }}
        />
      )}
      {dialog === "cart" && (
        <CartDrawer
          items={cart}
          onClose={() => setDialog(null)}
          onRemove={(id) =>
            setCart((items) => items.filter((item) => item.id !== id))
          }
        />
      )}
    </div>
  );
}
