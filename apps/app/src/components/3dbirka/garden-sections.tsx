"use client";

import { paths } from "@acme/config";
import { ArrowRight, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { ContactLink } from "./contact-link";

const examples = [
  {
    name: "Анна",
    region: "Московская область",
    season: "Рассада · первый сезон",
    text: "На подоконнике у каждого сорта своё место. Молочные бирки хорошо видны среди стаканчиков.",
  },
  {
    name: "Елена",
    region: "Краснодарский край",
    season: "Грядки · летний сезон",
    text: "Высокий флажок удобно читать, когда томаты подрастут. Названия остаются на виду.",
  },
  {
    name: "Михаил",
    region: "Ленинградская область",
    season: "Теплица · второй сезон",
    text: "Подвесные бирки закреплены на шпалере. Удобно сверяться со списком сортов.",
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

export function GardenSections({
  onNavigate,
}: {
  onNavigate?: (id: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setStatus("");
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
      setStatus(
        result.message ?? "Не удалось отправить заявку. Попробуйте позже.",
      );
      if (response.ok) form.reset();
    } catch {
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
                  src="/images/tag-photo-placeholder.svg"
                  alt={`Фото-заглушка: садовая бирка, ${review.season.toLowerCase()}`}
                  width={640}
                  height={440}
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
          <div>
            <span className="birka-eyebrow">Продолжение вашей коллекции</span>
            <h2>Скоро: опоры и кашпо</h2>
            <p>
              Оставьте почту — сообщим, когда новинки появятся в мастерской.
            </p>
          </div>
          <form onSubmit={subscribe}>
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
              Согласен получать письма о новинках 3D Бирка на указанную почту.
            </label>
            <p role="status">{status}</p>
          </form>
        </div>
      </section>
    </>
  );
}
