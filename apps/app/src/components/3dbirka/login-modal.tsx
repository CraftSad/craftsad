"use client";

import { paths } from "@acme/config";
import { loginFormSchema } from "@acme/validators";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Mail, Phone, Send, X } from "lucide-react";
import Link from "next/link";
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
        className="w-[44px] h-[44px] grid place-items-center border border-solid border-linen [background:white] rounded-full text-ink max-[800px]:[background:#ffffff75] max-[800px]:border-0 [&_svg]:w-[21px] [&_svg]:h-[21px] absolute right-[20px] top-[20px]"
        aria-label="Закрыть"
        onClick={onClose}
      >
        <X />
      </button>
      {done ? (
        <div className="[&>p]:text-hedge [&>p]:mb-[20px]">
          <span className="inline-flex items-center gap-[10px] uppercase tracking-[.17em] text-[13px] font-extrabold text-[#8b492e]">
            Личный кабинет
          </span>
          <h2 id="login-title" ref={accountHeading} tabIndex={-1}>
            Вы вошли
          </h2>
          <p>Ваши заказы и названия сортов — в одном месте.</p>
          <div
            className="grid grid-cols-[repeat(3,1fr)] gap-[5px] p-[5px] [background:#ecece5] rounded-[9px] mb-[20px] [&_button]:border-0 [&_button]:[background:transparent] [&_button]:rounded-[6px] [&_button]:min-h-[55px] [&_button]:p-[5px] [&_button]:text-ink [&_button]:text-[12px] [&_button]:font-extrabold [&_button]:leading-[1.2]"
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
            className="border border-solid border-linen rounded-[10px] [background:white] p-[20px] [&>strong]:font-[400] [&>strong]:text-[24px] [&>strong]:[font-family:Georgia,serif] [&_p]:text-hedge [&_p]:text-[16px] [&_p]:my-[12px] [&_p]:mx-[0] [&_small]:block [&_small]:text-hedge [&_small]:text-[15px] [&_small]:mt-[15px]"
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
            <div className="grid grid-cols-[repeat(3,1fr)] gap-[5px] my-[20px] mx-[0] [&_span]:border-top-[4px] [&_span]:border-top-[#d9ded8] [&_span]:pt-[7px] [&_span]:text-hedge [&_span]:text-[12px] [&_span]:leading-[1.2]">
              <span className="active">Печатаем</span>
              <span>Передано в Ozon</span>
              <span>Готово к выдаче</span>
            </div>
            <p>
              Трек-номер Ozon: <b>CS-1042-2026</b>
            </p>
            <button
              type="button"
              className="border-0 [background:none] text-forest underline text-[15px] font-bold py-[8px] px-[0] [&_svg]:w-[18px]"
              onClick={() => navigator.clipboard?.writeText("CS-1042-2026")}
            >
              <Copy /> Скопировать номер
            </button>
            <small>Это пример заказа для демонстрации.</small>
          </div>
          <div
            className="border border-solid border-linen rounded-[10px] [background:white] p-[20px] [&>strong]:font-[400] [&>strong]:text-[24px] [&>strong]:[font-family:Georgia,serif] [&_p]:text-hedge [&_p]:text-[16px] [&_p]:my-[12px] [&_p]:mx-[0] [&_small]:block [&_small]:text-hedge [&_small]:text-[15px] [&_small]:mt-[15px]"
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
              className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
              onClick={onRepeat}
            >
              Заказать такие же снова <ArrowRight />
            </button>
          </div>
          <div
            className="border border-solid border-linen rounded-[10px] [background:white] p-[20px] [&>strong]:font-[400] [&>strong]:text-[24px] [&>strong]:[font-family:Georgia,serif] [&_p]:text-hedge [&_p]:text-[16px] [&_p]:my-[12px] [&_p]:mx-[0] [&_small]:block [&_small]:text-hedge [&_small]:text-[15px] [&_small]:mt-[15px]"
            id="birka-panel-help"
            role="tabpanel"
            aria-labelledby="birka-tab-help"
            hidden={accountTab !== "help"}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: The panel starts with text that keyboard users need to reach.
            tabIndex={0}
          >
            <strong>Помощь мастера</strong>
            <p>Если понадобится помощь с выбором бирок, мы подскажем.</p>
            <button
              type="button"
              disabled
              className="w-full min-h-[56px] flex items-center justify-center gap-[10px] border border-solid border-linen rounded-[9px] [background:#f5f5f1] text-forest font-extrabold mt-[10px] [&_svg]:w-[20px]"
            >
              <Phone /> Позвонить
            </button>
            <button
              type="button"
              disabled
              className="w-full min-h-[56px] flex items-center justify-center gap-[10px] border border-solid border-linen rounded-[9px] [background:#f5f5f1] text-forest font-extrabold mt-[10px] [&_svg]:w-[20px]"
            >
              <Send /> Написать в Telegram
            </button>
            <small>Контакты появятся при запуске магазина.</small>
          </div>
        </div>
      ) : (
        <>
          <span className="inline-flex items-center gap-[10px] uppercase tracking-[.17em] text-[13px] font-extrabold text-[#8b492e]">
            Личный кабинет
          </span>
          <h2 id="login-title">
            {sent ? "Введите код" : "Войдите без пароля"}
          </h2>
          <p className="text-hedge mb-[25px] text-[15px]">
            {sent
              ? `Код для входа на ${contact}. В этой демонстрации используйте 1234.`
              : "Выберите удобный способ. Пароль запоминать не нужно."}
          </p>
          {!sent ? (
            <>
              <fieldset
                className="flex [background:#edece6] rounded-[9px] p-[5px] gap-[4px] mb-[24px] border-0 min-w-0 [&_button]:min-h-[49px] [&_button]:flex-[1] [&_button]:border-0 [&_button]:[background:transparent] [&_button]:rounded-[7px] [&_button]:text-ink [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:gap-[7px] [&_button]:font-bold [&_button]:text-[17px] [&_button]:relative [&_button]:isolate [&_svg]:w-[18px] [&_svg]:h-[18px] max-[570px]:[&_button]:text-[13px]"
                aria-label="Способ входа"
              >
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
              <form
                onSubmit={submitContact}
                className="flex flex-col [&_label]:block [&_label]:font-extrabold [&_label]:text-[16px] [&_label]:mb-[9px] [&_input]:w-full [&_input]:border-[1.5px] [&_input]:border-solid [&_input]:border-[#c8cec6] [&_input]:rounded-[12px] [&_input]:[background:white] [&_input]:text-ink [&_input]:py-[14px] [&_input]:px-[16px] [&_input]:text-[18px] [&_input]:leading-[1.5] [&_input]:mb-[17px]"
                noValidate
              >
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
                    className="text-[#9b321d] text-[15px] font-bold mt-[-7px] mb-[14px]"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <button
                  className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
                  type="submit"
                >
                  Получить код <ArrowRight />
                </button>
                <p className="text-[15px] text-hedge mt-[10px]">
                  Продолжая, вы соглашаетесь с{" "}
                  <Link
                    href={paths.legal.privacy}
                    className="underline underline-offset-2"
                  >
                    политикой конфиденциальности
                  </Link>{" "}
                  и даёте{" "}
                  <Link
                    href={paths.legal.consent}
                    className="underline underline-offset-2"
                  >
                    согласие на обработку персональных данных
                  </Link>
                  .
                </p>
              </form>
            </>
          ) : (
            <form
              className="flex flex-col [&_label]:block [&_label]:font-extrabold [&_label]:text-[16px] [&_label]:mb-[9px] [&_input]:w-full [&_input]:border-[1.5px] [&_input]:border-solid [&_input]:border-[#c8cec6] [&_input]:rounded-[12px] [&_input]:[background:white] [&_input]:text-ink [&_input]:py-[14px] [&_input]:px-[16px] [&_input]:text-[18px] [&_input]:leading-[1.5] [&_input]:mb-[17px]"
              onSubmit={(event) => {
                event.preventDefault();
                if (code === "1234") {
                  onLogin();
                  setError("");
                } else setError("Проверьте код. Для демонстрации: 1234");
              }}
            >
              <label htmlFor="login-code">Код из 4 цифр</label>
              <div className="relative h-[70px] mt-[10px] mb-[24px] [&_input]:absolute [&_input]:inset-0 [&_input]:w-full [&_input]:h-full [&_input]:m-0 [&_input]:opacity-[0] [&_input]:cursor-text">
                <div
                  className="grid grid-cols-[repeat(4,1fr)] gap-[12px] h-full pointer-events-none [&>span]:border [&>span]:border-solid [&>span]:border-[#d8decd] [&>span]:rounded-[14px] [&>span]:[background:#f0f2e9] [&>span]:grid [&>span]:place-items-center [&>span]:text-[30px] [&>span]:font-semibold [&>span]:text-[#233e2b]"
                  aria-hidden="true"
                >
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
                  className="text-center tracking-[.6em] text-[36px] font-bold rounded-[14px] pl-[34px] [background:repeating-linear-gradient(90deg,#e9eddf_0_22%,transparent_22%_26%)] max-[570px]:text-[29px]"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {error && (
                <p
                  className="text-[#9b321d] text-[15px] font-bold mt-[-7px] mb-[14px]"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <button
                className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
                type="submit"
              >
                Войти <ArrowRight />
              </button>
              <button
                type="button"
                className="border-0 [background:none] text-forest underline text-[15px] font-bold py-[8px] px-[0] [&_svg]:w-[18px]"
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
                className="border-0 [background:none] text-forest underline text-[15px] font-bold py-[8px] px-[0] [&_svg]:w-[18px]"
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
