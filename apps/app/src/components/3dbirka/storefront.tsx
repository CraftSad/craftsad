"use client";

import { loginFormSchema } from "@acme/validators";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
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
  Truck,
  UserRound,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
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

const LabelScene = dynamic(() => import("./label-scene"), { ssr: false });
const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 65,
      damping: 20,
      staggerChildren: 0.1,
    },
  },
};
function RollingNumber({ value }: { value: number }) {
  return (
    <span className="birka-rolling">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "65%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-65%", opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {money(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
function Pill({ active, group }: { active: boolean; group: string }) {
  return active ? (
    <motion.span
      className="birka-active-pill"
      layoutId={group}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
    />
  ) : null;
}

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
      className={
        drawer ? "birka-overlay birka-drawer-overlay" : "birka-overlay"
      }
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
        className="birka-backdrop"
        tabIndex={-1}
        aria-label="Закрыть окно"
        onClick={onClose}
      />
      <motion.div
        initial={drawer ? { x: "100%" } : { opacity: 0, y: 22, scale: 0.97 }}
        animate={{ x: 0, opacity: 1, y: 0, scale: 1 }}
        exit={drawer ? { x: "100%" } : { opacity: 0, y: 22, scale: 0.97 }}
        transition={{ type: "spring", damping: 32, stiffness: 270 }}
        className={drawer ? "birka-drawer" : "birka-modal"}
      >
        {children}
      </motion.div>
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
      className={`birka-preview ${small ? "birka-preview-small" : ""} birka-preview-${view}`}
      role="img"
      aria-label={`Бирка: ${name || "ваша надпись"}`}
    >
      <div
        className={`birka-label birka-label-${shape}`}
        style={
          {
            "--label-base": pair.base,
            "--label-ink": pair.ink,
          } as CSSProperties
        }
      >
        {shape === "hanging" && <span className="birka-label-hole" />}
        <span className="birka-label-text">{name || "Ваш сорт"}</span>
        {shape !== "hanging" && <span className="birka-label-stem" />}
      </div>
      {!small && <div className="birka-preview-shadow" />}
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
        className="birka-icon-button birka-close"
        aria-label="Закрыть"
        onClick={onClose}
      >
        <X />
      </button>
      {done ? (
        <div className="birka-account">
          <span className="birka-eyebrow">Личный кабинет</span>
          <h2 id="login-title" ref={accountHeading} tabIndex={-1}>
            Вы вошли
          </h2>
          <p>Ваши заказы и названия сортов — в одном месте.</p>
          <div
            className="birka-account-tabs"
            role="tablist"
            aria-label="Разделы личного кабинета"
          >
            {accountTabs.map(({ id, title }, index) => (
              <button
                key={id}
                id={`birka-tab-${id}`}
                type="button"
                role="tab"
                tabIndex={accountTab === id ? 0 : -1}
                aria-controls={`birka-panel-${id}`}
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
                  document.getElementById(`birka-tab-${next.id}`)?.focus();
                }}
              >
                {title}
              </button>
            ))}
          </div>
          <div
            className="birka-account-panel"
            id="birka-panel-orders"
            role="tabpanel"
            aria-labelledby="birka-tab-orders"
            hidden={accountTab !== "orders"}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: The panel starts with text that keyboard users need to reach.
            tabIndex={0}
          >
            <strong>Заказ № 1042</strong>
            <p>
              Статус: <b>Печатаем</b>
            </p>
            <div className="birka-order-progress">
              <span className="active">Печатаем</span>
              <span>Передано в Ozon</span>
              <span>Готово к выдаче</span>
            </div>
            <p>
              Трек-номер Ozon: <b>CS-1042-2026</b>
            </p>
            <button
              type="button"
              className="birka-text-button"
              onClick={() => navigator.clipboard?.writeText("CS-1042-2026")}
            >
              <Copy /> Скопировать номер
            </button>
            <small>Это пример заказа для демонстрации.</small>
          </div>
          <div
            className="birka-account-panel"
            id="birka-panel-lists"
            role="tabpanel"
            aria-labelledby="birka-tab-lists"
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
              className="birka-button birka-button-primary"
              onClick={onRepeat}
            >
              Заказать такие же снова <ArrowRight />
            </button>
          </div>
          <div
            className="birka-account-panel"
            id="birka-panel-help"
            role="tabpanel"
            aria-labelledby="birka-tab-help"
            hidden={accountTab !== "help"}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: The panel starts with text that keyboard users need to reach.
            tabIndex={0}
          >
            <strong>Помощь мастера</strong>
            <p>Если понадобится помощь с выбором бирок, мы подскажем.</p>
            <button type="button" disabled className="birka-help-button">
              <Phone /> Позвонить
            </button>
            <button type="button" disabled className="birka-help-button">
              <Send /> Написать в Telegram
            </button>
            <small>Контакты появятся при запуске магазина.</small>
          </div>
        </div>
      ) : (
        <>
          <span className="birka-eyebrow">Личный кабинет</span>
          <h2 id="login-title">
            {sent ? "Введите код" : "Войдите без пароля"}
          </h2>
          <p className="birka-modal-lead">
            {sent
              ? `Код для входа на ${contact}. В этой демонстрации используйте 1234.`
              : "Выберите удобный способ. Пароль запоминать не нужно."}
          </p>
          {!sent ? (
            <>
              <fieldset className="birka-segmented" aria-label="Способ входа">
                <button
                  type="button"
                  className={method === "phone" ? "active" : ""}
                  onClick={() => {
                    setMethod("phone");
                    setContact("");
                    setError("");
                  }}
                >
                  <Pill active={method === "phone"} group="login-method" />
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
                  <Pill active={method === "email"} group="login-method" />
                  <Mail /> По эл. почте
                </button>
              </fieldset>
              <form onSubmit={submitContact} className="birka-form" noValidate>
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
                  <p
                    id="login-contact-error"
                    className="birka-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <button
                  className="birka-button birka-button-primary"
                  type="submit"
                >
                  Получить код <ArrowRight />
                </button>
              </form>
            </>
          ) : (
            <form
              className="birka-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (code === "1234") {
                  onLogin();
                  setError("");
                } else setError("Проверьте код. Для демонстрации: 1234");
              }}
            >
              <label htmlFor="login-code">Код из 4 цифр</label>
              <div className="birka-otp">
                <div className="birka-otp-cells" aria-hidden="true">
                  {[0, 1, 2, 3].map((index) => (
                    <motion.span
                      key={index}
                      animate={{
                        borderColor:
                          code.length === index ? "#718568" : "#d8decd",
                        scale: code.length === index ? 1.03 : 1,
                      }}
                    >
                      {code[index] ?? ""}
                    </motion.span>
                  ))}
                </div>
                <input
                  ref={codeInput}
                  id="login-code"
                  className="birka-code-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {error && (
                <p className="birka-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="birka-button birka-button-primary"
                type="submit"
              >
                Войти <ArrowRight />
              </button>
              <button
                type="button"
                className="birka-text-button"
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
                className="birka-text-button"
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
      <div className="birka-drawer-head">
        <div>
          <span className="birka-eyebrow">Ваш заказ</span>
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
          className="birka-icon-button"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <X />
        </button>
      </div>
      {demoComplete ? (
        <div className="birka-empty">
          <PackageCheck />
          <h3 ref={completion} tabIndex={-1}>
            Демонстрация завершена
          </h3>
          <p>Заказ не создан. Данные не сохранены и не отправлены.</p>
          <button
            type="button"
            className="birka-button birka-button-primary"
            onClick={onClose}
          >
            Вернуться в магазин
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="birka-empty">
          <ShoppingBag />
          <h3>Пока пусто</h3>
          <p>Добавьте бирки со своими названиями — они появятся здесь.</p>
          <button
            type="button"
            className="birka-button birka-button-primary"
            onClick={onClose}
          >
            Выбрать бирки
          </button>
        </div>
      ) : (
        <>
          <div className="birka-delivery-note">
            <Truck />
            <span>
              Доставка в пункт выдачи Ozon по всей России — обычно 2–4 дня
            </span>
          </div>
          <div className="birka-cart-items">
            {items.map((item) => (
              <article className="birka-cart-item" key={item.id}>
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
                    className="birka-text-button"
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
              id="birka-checkout"
              className="birka-form birka-checkout"
              noValidate
              onSubmit={submitCheckout}
            >
              <p className="birka-helper">
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
                <p
                  id="checkout-name-error"
                  className="birka-error"
                  role="alert"
                >
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
                <p
                  id="checkout-phone-error"
                  className="birka-error"
                  role="alert"
                >
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
                <p
                  id="checkout-city-error"
                  className="birka-error"
                  role="alert"
                >
                  {errors.city}
                </p>
              )}
              <fieldset
                className="birka-segmented"
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
                  className="birka-error"
                  role="alert"
                >
                  {errors.address}
                </p>
              )}
              <p className="birka-helper">
                Выбор на карте станет доступен после подключения службы
                доставки.
              </p>
            </form>
          )}
          <div className="birka-cart-footer">
            <div className="birka-total">
              <span>Итого</span>
              <strong>{money(total)} ₽</strong>
            </div>
            <button
              className="birka-button birka-button-primary"
              type={checkout ? "submit" : "button"}
              form={checkout ? "birka-checkout" : undefined}
              onClick={
                checkout
                  ? undefined
                  : (event) => {
                      event.preventDefault();
                      setCheckout(true);
                    }
              }
            >
              {checkout ? "Завершить демонстрацию" : "Оформить заказ"}
              <ArrowRight />
            </button>
            {checkout && (
              <button
                type="button"
                className="birka-text-button"
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
  const reducedMotion = useReducedMotion();
  const [category, setCategory] = useState<"all" | "seedling" | "garden">(
    "all",
  );
  const [shape, setShape] = useState<ShapeId>("stake");
  const [color, setColor] = useState(0);
  const [namesText, setNamesText] = useState(
    "Томат Бычье сердце\nОгурец Зозуля\nПерец Калифорнийское чудо",
  );
  const [view, setView] = useState<View>("front");
  const resetView = useRef<(() => void) | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [dialog, setDialog] = useState<"login" | "cart" | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [added, setAdded] = useState(false);
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  function selectView(nextView: View) {
    resetView.current?.();
    setView(nextView);
  }
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
    <MotionConfig reducedMotion="user">
      <div className="birka-site">
        <header className="birka-header">
          <div className="birka-header-inner">
            <button
              type="button"
              className="birka-brand"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: scrollBehavior() })
              }
              aria-label="3dbirka — на главную"
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
                <button type="button" onClick={() => scrollTo("catalog")}>
                  Каталог <ChevronDown />
                </button>
                <div className="birka-nav-menu">
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
                Конструктор
              </button>
            </nav>
            <div className="birka-header-actions">
              <button
                type="button"
                className="birka-login-button"
                aria-label="Войти"
                onClick={() => setDialog("login")}
              >
                <UserRound />
                <span>Войти</span>
              </button>
              <button
                type="button"
                className="birka-cart-button"
                aria-label={`Корзина: ${cartCount} шт., ${money(cartTotal)} ₽`}
                onClick={() => setDialog("cart")}
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
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </header>
        <main>
          <section className="birka-hero">
            <div className="birka-container birka-hero-grid">
              <motion.div
                className="birka-hero-copy"
                initial="hidden"
                animate="visible"
                variants={reveal}
              >
                <motion.div variants={reveal} className="birka-hero-edition">
                  <span /> Маленькие детали. Большой сад.
                </motion.div>
                <motion.h1 variants={reveal}>
                  Вечные садовые
                  <br />
                  бирки с названиями
                  <br />
                  <em>ваших сортов</em>
                  <span className="birka-title-dot">.</span>
                </motion.h1>
                <motion.p variants={reveal}>
                  Вы растите любимые растения.
                  <br />
                  Мы сохраняем их имена — в объёмных
                  <br className="birka-desktop-break" /> буквах, красивых цветах
                  и надолго.
                </motion.p>
                <motion.div variants={reveal} className="birka-hero-actions">
                  <motion.button
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="birka-button birka-button-primary"
                    onClick={() => scrollTo("constructor")}
                  >
                    Создать свой набор <ArrowRight />
                  </motion.button>
                  <button
                    type="button"
                    className="birka-button birka-button-light"
                    onClick={() => scrollTo("catalog")}
                  >
                    Готовые коллекции <span>↗</span>
                  </button>
                </motion.div>
                <motion.div variants={reveal} className="birka-hero-caption">
                  <span className="birka-mini-leaves">
                    <Leaf />
                    <Leaf />
                    <Leaf />
                  </span>
                  <span>
                    Для тех, кто знает
                    <br />
                    <b>каждое растение по имени</b>
                  </span>
                </motion.div>
              </motion.div>
              <div
                className="birka-hero-art"
                role="img"
                aria-label="Коллекция садовых бирок в молочном, хвойном и терракотовом цветах"
              >
                <div className="birka-orbit birka-orbit-one" />
                <div className="birka-orbit birka-orbit-two" />
                <span className="birka-art-coordinate">
                  3DBIRKA OBJECTS — 01 / 03
                </span>
                <div className="birka-art-leaf birka-art-leaf-one" />
                <div className="birka-art-leaf birka-art-leaf-two" />
                <div className="birka-art-leaf birka-art-leaf-three" />
                {[
                  { color: 1, name: "БАЗИЛИК\nЗелёный аромат" },
                  { color: 0, name: "ТОМАТ\nБычье сердце" },
                  { color: 2, name: "КЛУБНИКА\nЕлизавета" },
                ].map((tag, i) => (
                  <motion.div
                    key={tag.color}
                    className={`birka-hero-tag birka-hero-tag-${i}`}
                    animate={
                      reducedMotion
                        ? {}
                        : { y: [0, -12, 0], rotate: [0, 1.5, 0] }
                    }
                    transition={{
                      duration: 6 + i,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.7,
                    }}
                  >
                    <LabelPreview
                      shape="stake"
                      color={tag.color}
                      name={tag.name}
                    />
                  </motion.div>
                ))}
                <div className="birka-hero-delivery">
                  <span>
                    <Truck />
                  </span>
                  <div>
                    Из мастерской — к вам
                    <small>В пункты Ozon по всей России</small>
                  </div>
                  <ArrowRight />
                </div>
                <span className="birka-art-material">
                  МАТОВЫЙ ПЛАСТИК · ОБЪЁМНАЯ ПЕЧАТЬ
                </span>
              </div>
            </div>
            <div className="birka-hero-rule birka-container">
              <span>Красота, которая остаётся на сезоны</span>
              <span>
                Сделано в России <span>↗</span>
              </span>
            </div>
          </section>
          <motion.section
            id="how"
            className="birka-section birka-how"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={reveal}
          >
            <div className="birka-container">
              <div className="birka-section-top">
                <h2>
                  Природа меняется.
                  <br />
                  <em>Имена остаются.</em>
                </h2>
                <p>
                  Продумали каждую деталь, чтобы вы
                  <br />
                  просто наслаждались своим садом.
                </p>
              </div>
              <div className="birka-bento">
                <motion.article
                  variants={reveal}
                  whileHover={{ y: -4 }}
                  className="birka-bento-weather"
                >
                  <div className="birka-bento-photo" />
                  <div className="birka-bento-text">
                    <ShieldCheck />
                    <h3>
                      Не выгорают на солнце.
                      <br />
                      Не боятся дождя.
                    </h3>
                    <p>Прочный пластик для жизни под открытым небом.</p>
                  </div>
                </motion.article>
                <motion.article
                  variants={reveal}
                  whileHover={{ y: -4 }}
                  className="birka-bento-type"
                >
                  <div className="birka-relief">
                    Базилик<span>ОБЪЁМ ИМЕЕТ ЗНАЧЕНИЕ</span>
                  </div>
                  <div>
                    <h3>Читаются за метр</h3>
                    <p>
                      Буквы напечатаны вместе с биркой.
                      <br />
                      Надпись не сотрётся со временем.
                    </p>
                  </div>
                </motion.article>
                <motion.article
                  variants={reveal}
                  whileHover={{ y: -4 }}
                  className="birka-bento-delivery"
                >
                  <div className="birka-two-days">
                    2<span>дня</span>
                    <ArrowRight />
                  </div>
                  <div>
                    <h3>И уже на пути к вам</h3>
                    <p>
                      Напечатаем ваш набор и отправим
                      <br />в удобный пункт Ozon.
                    </p>
                  </div>
                </motion.article>
              </div>
            </div>
          </motion.section>
          <section id="constructor" className="birka-section birka-constructor">
            <div className="birka-container">
              <div className="birka-section-top">
                <div>
                  <h2>
                    Ваша маленькая <em>дизайн-студия</em>
                  </h2>
                </div>
                <p>
                  Ваши сорта. Ваши цвета. Ваша бирка.
                  <br />
                  Покрутите её — она уже почти настоящая.
                </p>
              </div>
              <div className="birka-builder">
                <div className="birka-builder-left">
                  <div className="birka-builder-preview">
                    <div className="birka-preview-top">
                      <span>
                        <span className="birka-live-dot" /> Живой просмотр
                      </span>
                      <span>
                        {Math.min(previewIndex + 1, Math.max(names.length, 1))}{" "}
                        из {Math.max(names.length, 1)}
                      </span>
                    </div>
                    <LabelScene
                      shape={shape}
                      color={color}
                      name={
                        names[previewIndex % Math.max(names.length, 1)] ??
                        "Ваш сорт"
                      }
                      view={view}
                      resetViewRef={resetView}
                      fallback={
                        <LabelPreview
                          shape={shape}
                          color={color}
                          name={
                            names[previewIndex % Math.max(names.length, 1)] ??
                            "Ваш сорт"
                          }
                          view={view}
                        />
                      }
                    />
                    <div className="birka-preview-pager">
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
                    className="birka-view-controls"
                    aria-label="Ракурс бирки"
                  >
                    <button
                      type="button"
                      className={view === "front" ? "active" : ""}
                      onClick={() => selectView("front")}
                    >
                      <Pill active={view === "front"} group="view" />
                      Спереди
                    </button>
                    <button
                      type="button"
                      className={view === "side" ? "active" : ""}
                      onClick={() => selectView("side")}
                    >
                      <Pill active={view === "side"} group="view" />
                      Сбоку
                    </button>
                    <button
                      type="button"
                      className={view === "rotate" ? "active" : ""}
                      onClick={() => selectView("rotate")}
                    >
                      <Pill active={view === "rotate"} group="view" />
                      <RotateCcw /> 360°
                    </button>
                  </fieldset>
                  <p className="birka-preview-note">
                    Изображение помогает представить изделие. Готовая бирка
                    может немного отличаться.
                  </p>
                </div>
                <div className="birka-builder-right">
                  <div className="birka-builder-step">
                    <div className="birka-builder-heading">
                      <span>1</span>
                      <div>
                        <h3>Форма</h3>
                        <p>Для стаканчиков, грядок или теплицы</p>
                      </div>
                    </div>
                    <div className="birka-shapes">
                      {shapes.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          className={
                            shape === item.id
                              ? "birka-shape active"
                              : "birka-shape"
                          }
                          aria-pressed={shape === item.id}
                          onClick={() => {
                            setShape(item.id);
                            setAdded(false);
                          }}
                        >
                          <span
                            className={`birka-shape-icon birka-shape-icon-${item.id}`}
                          >
                            <i />
                          </span>
                          <span>
                            <Pill active={shape === item.id} group="shape" />
                            <strong>
                              {item.id === "stake"
                                ? "Колышек"
                                : item.id === "flag"
                                  ? "Флажок"
                                  : "Подвесная"}
                            </strong>
                            <small>{item.size}</small>
                          </span>
                          {shape === item.id && <Check />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="birka-builder-step">
                    <div className="birka-builder-heading">
                      <span>2</span>
                      <div>
                        <h3>Цвет</h3>
                        <p>Шесть сочетаний, которые хорошо читаются</p>
                      </div>
                    </div>
                    <div className="birka-colors">
                      {colorPairs.map((pair, index) => (
                        <button
                          type="button"
                          key={pair.name}
                          title={`${pair.name} — ${pair.label}`}
                          aria-label={`${pair.name} — ${pair.label}`}
                          className={
                            color === index
                              ? "birka-color active"
                              : "birka-color"
                          }
                          aria-pressed={color === index}
                          onClick={() => {
                            setColor(index);
                            setAdded(false);
                          }}
                        >
                          <span
                            className="birka-color-swatch"
                            style={{
                              background: `linear-gradient(135deg, ${pair.base} 0% 64%, ${pair.ink} 64% 100%)`,
                            }}
                          ></span>
                          <span>
                            <strong>{pair.name}</strong>
                            <small>{pair.label}</small>
                          </span>
                          {color === index && <Check />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="birka-builder-step">
                    <div className="birka-builder-heading">
                      <span>3</span>
                      <div>
                        <h3>Ваши сорта</h3>
                        <p>Одно название — одна бирка</p>
                      </div>
                    </div>
                    <label htmlFor="varieties" className="birka-field-label">
                      Названия сортов, каждое с новой строки
                    </label>
                    <textarea
                      id="varieties"
                      rows={3}
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
                    <div className="birka-variety-help">
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
                  <div className="birka-builder-step birka-builder-final">
                    <div className="birka-builder-heading">
                      <span>4</span>
                      <div>
                        <h3>Ваш набор готов</h3>
                        <p>Проверьте количество и стоимость</p>
                      </div>
                    </div>
                    <div className="birka-summary">
                      <span>
                        <RollingNumber value={names.length} />{" "}
                        {countForm === "one" || countForm === "few"
                          ? labelForms[countForm]
                          : labelForms.many}{" "}
                        · {chosenShape.size}
                      </span>
                      <strong>
                        <RollingNumber value={price} /> ₽
                      </strong>
                    </div>
                    <button
                      type="button"
                      className="birka-button birka-button-primary"
                      disabled={!names.length}
                      onClick={addToCart}
                    >
                      {added ? "Добавить ещё один набор" : "Добавить в корзину"}
                      <ShoppingBag />
                    </button>
                    <p className="birka-helper">
                      Оплатить можно будет после подтверждения заказа.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section id="catalog" className="birka-section birka-catalog">
            <div className="birka-container">
              <div className="birka-section-top">
                <div>
                  <h2>
                    Собраны с <em>чувством сада</em>
                  </h2>
                </div>
                <p>
                  Подобрали удобные наборы для рассады, грядок и теплицы. Любую
                  надпись можно изменить.
                </p>
              </div>
              <fieldset className="birka-filters" aria-label="Категории">
                <button
                  type="button"
                  className={category === "all" ? "active" : ""}
                  onClick={() => setCategory("all")}
                >
                  <Pill active={category === "all"} group="catalog" />
                  Все наборы
                </button>
                <button
                  type="button"
                  className={category === "seedling" ? "active" : ""}
                  onClick={() => setCategory("seedling")}
                >
                  <Pill active={category === "seedling"} group="catalog" />
                  Для рассады
                </button>
                <button
                  type="button"
                  className={category === "garden" ? "active" : ""}
                  onClick={() => setCategory("garden")}
                >
                  <Pill active={category === "garden"} group="catalog" />
                  Для грядок
                </button>
              </fieldset>
              <div className="birka-products">
                {presets
                  .filter(
                    (preset) =>
                      category === "all" || preset.category === category,
                  )
                  .map((preset, index) => (
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -4 }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                      }}
                      className="birka-product"
                      key={preset.title}
                    >
                      <div
                        className={`birka-product-art birka-art-${index % 3}`}
                      >
                        <span className="birka-product-badge">
                          {preset.count} бирок
                        </span>
                        <LabelPreview
                          shape={preset.shape}
                          color={preset.color}
                          name={preset.names[0] ?? ""}
                          small
                        />
                      </div>
                      <div className="birka-product-body">
                        <span className="birka-product-category">
                          {preset.category === "seedling"
                            ? "Для рассады"
                            : "Для грядок"}{" "}
                          ·{" "}
                          {
                            shapes.find((item) => item.id === preset.shape)
                              ?.size
                          }
                        </span>
                        <h3>{preset.title}</h3>
                        <p>
                          {preset.names.slice(0, 3).join(", ")}
                          {preset.names.length > 3 ? " и другие" : ""}
                        </p>
                        <div className="birka-product-footer">
                          <strong>{money(preset.price)} ₽</strong>
                          <button
                            type="button"
                            onClick={() => applyPreset(preset)}
                          >
                            Настроить надпись <ArrowRight />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
              </div>
            </div>
          </section>
          <section className="birka-promise">
            <div className="birka-container">
              <div>
                <h2>
                  Чтобы помнить каждый сорт
                  <br />и радоваться каждому ростку
                </h2>
              </div>
              <button
                type="button"
                className="birka-button birka-button-light"
                onClick={() => scrollTo("constructor")}
              >
                Создать свои бирки <ArrowRight />
              </button>
            </div>
          </section>
        </main>
        <footer className="birka-footer">
          <div className="birka-container">
            <div>
              <strong>3dbirka</strong>
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
          <div className="birka-footer-bottom birka-container">
            <span>© {year} 3dbirka</span>
            <span>Пусть всё растёт 🌱</span>
          </div>
        </footer>
        <AnimatePresence>
          {dialog === "login" && (
            <LoginModal
              key="login"
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
              key="cart"
              items={cart}
              onClose={() => setDialog(null)}
              onRemove={(id) =>
                setCart((items) => items.filter((item) => item.id !== id))
              }
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
