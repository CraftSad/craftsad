"use client";

import { paths } from "@acme/config";
import { ArrowRight, BellRing, Check, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ContactLink } from "./contact-link";
import { colorPairs } from "./data";

const examples = [
  {
    name: "Анна",
    region: "Московская область",
    season: "Рассада · первый сезон",
    text: "На подоконнике у каждого сорта своё место. Молочные бирки хорошо видны среди стаканчиков.",
    image: "/images/garden/seedlings.webp",
    alt: "Молочная бирка «Томат» в горшке с рассадой на солнечном подоконнике",
  },
  {
    name: "Елена",
    region: "Краснодарский край",
    season: "Грядки · летний сезон",
    text: "Высокий флажок удобно читать, когда томаты подрастут. Названия остаются на виду.",
    image: "/images/garden/tomatoes.webp",
    alt: "Терракотовая бирка-флажок «Черри» среди томатов на грядке",
  },
  {
    name: "Михаил",
    region: "Ленинградская область",
    season: "Теплица · второй сезон",
    text: "Подвесные бирки закреплены на шпалере. Удобно сверяться со списком сортов.",
    image: "/images/garden/greenhouse.webp",
    alt: "Зелёная подвесная бирка «Базилик» на шпалере в теплице",
  },
];
const questions = [
  {
    category: "Материалы и уход",
    question: "Выдержат ли бирки зиму в грунте и палящее солнце?",
    answer:
      "Да. Мы печатаем бирки из плотного атмосферостойкого пластика, который не выгорает под ультрафиолетом и не становится хрупким на морозе. Буквы формируются объёмным рельефом прямо в корпусе, поэтому надпись невозможно смыть дождём или стереть землёй.",
    chips: ["Зимостойкий пластик", "Объёмный рельеф букв", "На много сезонов"],
  },
  {
    category: "Установка в саду",
    question: "Не сломается ли колышек при установке в плотную почву?",
    answer:
      "Толщина стенки и геометрия ножки рассчитаны на регулярную работу в грунте. Для стаканчиков и рыхлых грядок бирка входит легко, а плотную или пересохшую землю лучше предварительно пролить водой либо наметить лунку — не забивайте бирку силой в твёрдую корку.",
    chips: ["Усиленная ножка", "Колышек 10 см / Флажок 18 см"],
  },
  {
    category: "Индивидуальный заказ",
    question: "Какой длины могут быть названия сортов и как они размещаются?",
    answer:
      "Каждая строка в списке — отдельная бирка. Короткие названия до 18 символов печатаются в одну крупную строку, а названия от 19 до 28 символов мы аккуратно распределяем на 2 строки с сохранением читаемости. Перед печатью мастер дополнительно проверяет вёрстку каждой бирки.",
    chips: ["До 28 символов на бирку", "Ручная проверка макета"],
  },
  {
    category: "Сборка набора",
    question: "Можно ли смешать разные формы и получить скидку за объём?",
    answer:
      "Конечно. В один заказ можно добавить сразу несколько наборов: например, колышки 10 см для рассады, высокие флажки 18 см для грядок и подвесные бирки 8 см с отверстием 4 мм для теплицы. При заказе от 15 бирок в наборе действует скидка 10%, а от 30 бирок — 15%.",
    chips: ["Скидка 10% от 15 шт.", "Скидка 15% от 30 шт."],
  },
  {
    category: "Сроки и доставка",
    question: "Сколько стоит и сколько идёт доставка?",
    answer:
      "Изготовление именного набора в мастерской занимает 1–2 рабочих дня. Отправляем заказы в любой удобный пункт выдачи Ozon по всей России: стоимость доставки — от 190 ₽, а при заказе от 2 000 ₽ доставка бесплатная. Точный срок в пути покажем перед подтверждением заказа и пришлём трек-номер.",
    chips: ["Печать 1–2 дня", "Пункты Ozon по РФ", "Бесплатно от 2 000 ₽"],
  },
  {
    category: "Оплата и гарантия",
    question:
      "Как происходит оплата заказа и что делать, если в надписи ошибка?",
    answer:
      "Оплата проходит только после того, как мы проверим переносы строк и подтвердим ваш макет: вы получите ссылку на оплату через СБП или банковской картой и официальный чек самозанятого (НПД). Если при печати мы допустим ошибку в названии или бирка приедет с дефектом — бесплатно перепечатаем и отправим замену за свой счёт.",
    chips: [
      "СБП и карты",
      "Официальный чек ФНС",
      "Бесплатная перепечатка брака",
    ],
  },
];

const upcomingItems = [
  {
    id: "trellis",
    num: "01",
    badge: "В тестировании",
    title: "Модульные опоры",
    subtitle: "Для рассады и комнатных растений",
    description:
      "Ажурные решётки и кольца, которые наращиваются по высоте вместе с кустом и не травмируют стебли.",
    specs: ["Высота 25–45 см", "Стыковка в 1 клик"],
  },
  {
    id: "planter",
    num: "02",
    badge: "Прототип",
    title: "Фактурные кашпо",
    subtitle: "С дренажем и пазом под бирку",
    description:
      "Кашпо с матовым рельефом, скрытым поддоном для лишней воды и аккуратным держателем под именную бирку.",
    specs: ["Объём 0,8 и 1,6 л", "Скрытый поддон"],
  },
] as const;

export function GardenSections({
  onNavigate,
}: {
  onNavigate?: (id: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [statusOk, setStatusOk] = useState(false);
  const [pending, setPending] = useState(false);
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setStatus("");
    setStatusOk(false);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
        }),
      });
      const result = await response.json();
      setStatusOk(response.ok);
      setStatus(
        result.message ?? "Не удалось отправить заявку. Попробуйте позже.",
      );
      if (response.ok) form.reset();
    } catch {
      setStatusOk(false);
      setStatus("Нет связи с сервером. Попробуйте ещё раз позже.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <section className="birka-section birka-garden" id="garden">
        <div className="birka-container">
          <div className="birka-section-top">
            <h2>
              Бирки <em>в деле</em>
            </h2>
            <p>
              Место для ваших историй из сада. Ниже — примеры оформления
              отзывов; имена и тексты демонстрационные.
            </p>
          </div>
          <div className="birka-reviews">
            {examples.map((review) => (
              <article key={review.name}>
                <Image
                  src={review.image}
                  alt={review.alt}
                  width={1200}
                  height={900}
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                />
                <div>
                  <span className="birka-demo-badge">Пример отзыва</span>
                  <p>«{review.text}»</p>
                  <strong>
                    {review.name} · {review.region}
                  </strong>
                  <small>{review.season}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="birka-section birka-faq" id="faq">
        <div className="birka-container">
          <div className="birka-faq-grid">
            <div className="birka-faq-intro">
              <span className="birka-eyebrow">Мастерская 3D Бирка</span>
              <h2>
                Частые <em>вопросы</em>
              </h2>
              <p>
                Собрали главное о материале, именной 3D-печати, сроках и
                доставке в ваш сад.
              </p>
              <dl className="birka-faq-stats">
                <div>
                  <dt>1–2 дня</dt>
                  <dd>печать и проверка каждого макета</dd>
                </div>
                <div>
                  <dt>от 0 ₽</dt>
                  <dd>доставка в Ozon от 2 000 ₽ (иначе от 190 ₽)</dd>
                </div>
                <div>
                  <dt>−15%</dt>
                  <dd>выгода на большие наборы от 30 бирок</dd>
                </div>
              </dl>
              <div className="birka-faq-card">
                <strong>Нужен нестандартный размер или совет мастера?</strong>
                <p>
                  Поможем подобрать форму под ваши грядки и кашпо или проверим
                  большой список сортов перед заказом.
                </p>
                <div className="birka-faq-card-actions">
                  <ContactLink />
                  {onNavigate && (
                    <button
                      type="button"
                      className="birka-faq-link"
                      onClick={() => onNavigate("constructor")}
                    >
                      Перейти в конструктор <ArrowRight />
                    </button>
                  )}
                </div>
                <Link
                  href={paths.legal.delivery}
                  className="birka-faq-legal-link"
                >
                  Подробнее об условиях оплаты, доставки и возврата →
                </Link>
              </div>
            </div>
            <div className="birka-faq-list">
              {questions.map((item, index) => (
                <details
                  name="garden-faq"
                  key={item.question}
                  open={index === 0 ? true : undefined}
                >
                  <summary>
                    <span className="birka-faq-num">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="birka-faq-heading">
                      <small>{item.category}</small>
                      <span>{item.question}</span>
                    </span>
                    <span className="birka-faq-icon" aria-hidden="true">
                      <Plus />
                    </span>
                  </summary>
                  <div className="birka-faq-body">
                    <p>{item.answer}</p>
                    <div className="birka-faq-chips">
                      {item.chips.map((chip) => (
                        <span key={chip}>{chip}</span>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="birka-section birka-newsletter" id="newsletter">
        <div className="birka-container">
          <div className="birka-newsletter-shell">
            <div className="birka-newsletter-grid">
              <div className="birka-newsletter-lead">
                <div className="birka-newsletter-topline">
                  <span className="birka-eyebrow">
                    Продолжение вашей коллекции
                  </span>
                  <span className="birka-newsletter-pill">
                    <Sparkles aria-hidden="true" /> Анонс мастерской
                  </span>
                </div>
                <h2>
                  Скоро: опоры <em>и кашпо</em> в цвет ваших бирок
                </h2>
                <p>
                  Готовим новые предметы для подоконника, балкона и теплицы из
                  того же матового атмосферостойкого пластика. Оставьте почту —
                  пришлём приглашение на первый тираж.
                </p>

                <div className="birka-newsletter-previews">
                  {upcomingItems.map((item) => (
                    <article
                      key={item.id}
                      className="birka-newsletter-preview-card"
                    >
                      <div className="birka-newsletter-preview-head">
                        <div
                          className="birka-newsletter-sketch"
                          aria-hidden="true"
                        >
                          {item.id === "trellis" ? (
                            <svg
                              viewBox="0 0 40 40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <title>Модульная опора</title>
                              <path d="M13 35V12a7 7 0 0 1 14 0v23" />
                              <path d="M9 20h22" />
                              <path d="M10 27h20" />
                              <circle cx="20" cy="12" r="2.5" />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 40 40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <title>Фактурное кашпо</title>
                              <path d="M9 14h22l-2.4 17a3 3 0 0 1-3 2.6H14.4a3 3 0 0 1-3-2.6L9 14Z" />
                              <path d="M7 14h26" />
                              <path d="M15 19v9" />
                              <path d="M20 19v9" />
                              <path d="M25 19v9" />
                              <path d="M26 9.5l3-4.5" />
                            </svg>
                          )}
                        </div>
                        <div className="birka-newsletter-preview-meta">
                          <span className="birka-newsletter-badge">
                            {item.badge}
                          </span>
                          <span className="birka-newsletter-num">
                            № {item.num}
                          </span>
                        </div>
                      </div>
                      <h3>{item.title}</h3>
                      <small>{item.subtitle}</small>
                      <p>{item.description}</p>
                      <div className="birka-newsletter-specs">
                        {item.specs.map((spec) => (
                          <span key={spec}>{spec}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="birka-newsletter-palette">
                  <div className="birka-newsletter-swatches" aria-hidden="true">
                    {colorPairs.map((pair) => (
                      <span
                        key={pair.name}
                        title={pair.name}
                        style={{
                          background: pair.base,
                          borderColor: pair.ink,
                        }}
                      />
                    ))}
                  </div>
                  <span>
                    Единая палитра мастерской — <strong>6 оттенков</strong> в
                    тон вашим биркам
                  </span>
                </div>
              </div>

              <div className="birka-newsletter-panel">
                <div className="birka-newsletter-panel-top">
                  <span
                    className="birka-newsletter-panel-icon"
                    aria-hidden="true"
                  >
                    <BellRing />
                  </span>
                  <div>
                    <strong>Лист ожидания первого тиража</strong>
                    <span>Напишем один раз, когда откроем предзаказ</span>
                  </div>
                </div>

                <ul className="birka-newsletter-perks">
                  <li>
                    <Check aria-hidden="true" />
                    <span>Ранний доступ к первой партии и выбору оттенков</span>
                  </li>
                  <li>
                    <Check aria-hidden="true" />
                    <span>
                      Закрытая скидка 10% для подписчиков листа ожидания
                    </span>
                  </li>
                </ul>

                <form onSubmit={subscribe} className="birka-newsletter-form">
                  <label htmlFor="newsletter-email">Электронная почта</label>
                  <div className="birka-subscribe-row">
                    <input
                      type="email"
                      id="newsletter-email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.ru"
                      required
                      maxLength={254}
                    />
                    <button
                      type="submit"
                      className="birka-button birka-button-primary"
                      disabled={pending}
                    >
                      {pending ? "Отправляем…" : "Сообщить о новинках"}
                    </button>
                  </div>
                  <label className="birka-consent">
                    <input type="checkbox" name="consent" required />
                    <span>
                      Согласен получать письма о новинках 3D Бирка на указанную
                      почту. Без спама — отписка в один клик.
                    </span>
                  </label>
                  <p
                    role="status"
                    aria-live="polite"
                    className={`birka-newsletter-status ${status ? (statusOk ? "is-success" : "is-error") : ""}`}
                  >
                    {status}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
