"use client";

import { loginFormSchema } from "@acme/validators";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Mail, Phone, Send, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { formatPhone, phoneSchema } from "./shared";
import { Pill, StorefrontDialog } from "./ui";

const accountTabs = [
  { id: "orders", title: "Мои заказы" },
  { id: "lists", title: "Мои списки сортов" },
  { id: "help", title: "Помощь мастера" },
] as const;

export function LoginModal({
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
