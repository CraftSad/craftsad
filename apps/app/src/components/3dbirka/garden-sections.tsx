"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";

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
  [
    "Выдержат ли бирки зиму в грунте и палящее солнце?",
    "Прочный атмосферостойкий пластик не выгорает и не трескается на морозе. Буквы вплавлены в корпус, поэтому надпись не смывается дождём.",
  ],
  [
    "Не сломается ли колышек при установке в плотную почву?",
    "Толщина стенки и рёбра жёсткости рассчитаны на установку в грунт. Плотную землю предварительно пролейте или сделайте лунку: не вдавливайте бирку силой в сухую почву.",
  ],
  [
    "Сколько стоит и сколько идёт доставка?",
    "Печать за 2 рабочих дня. Отправляем в любой пункт выдачи Ozon по России от 190 ₽, бесплатно при заказе от 2 000 ₽. Срок в пути зависит от региона — уточним его перед подтверждением заказа.",
  ],
  [
    "Как происходит оплата заказа?",
    "После оформления мы проверяем переносы строк в ваших названиях и отправляем ссылку на оплату через СБП или картой.",
  ],
];

export function GardenSections() {
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
          <h2>
            Частые <em>вопросы</em>
          </h2>
          {questions.map(([question, answer]) => (
            <details name="garden-faq" key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
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
