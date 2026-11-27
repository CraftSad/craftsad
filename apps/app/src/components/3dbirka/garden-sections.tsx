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
      <section
        className="py-[90px] px-[0] max-[570px]:py-[55px] max-[570px]:px-[0] max-[800px]:py-[65px] max-[800px]:px-[0] [&_h2]:[font:400_clamp(38px,4vw,56px)/1.15_Georgia,serif] [&_h2]:tracking-[-.035em] [&_h2]:m-0 [&_h2]:text-[clamp(40px,4.3vw,62px)] [&_h2]:leading-[1.03] max-[570px]:[&_h2]:text-[43px] max-[800px]:[&_h2]:text-[43px] birka-garden"
        id="garden"
      >
        <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
          <div className="flex justify-between items-center gap-[50px] mb-[36px] max-[570px]:block max-[570px]:mb-[26px] max-[800px]:flex max-[800px]:gap-[24px] [&>p]:max-w-[370px] [&>p]:text-[#b0bdb2] [&>p]:text-[15px] [&>p]:mb-[5px] [&>p]:leading-[1.8] max-[800px]:[&>p]:mt-[18px] max-[800px]:[&>p]:text-[13px] max-[800px]:[&>p]:m-0 max-[800px]:[&>p]:max-w-[240px] max-[570px]:[&>p]:text-[15px] max-[570px]:[&>p]:mt-[18px] max-[570px]:[&>p]:max-w-none">
            <h2>
              Бирки <em>в деле</em>
            </h2>
            <p>
              Место для ваших историй из сада. Ниже — примеры оформления
              отзывов; имена и тексты демонстрационные.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(3,1fr)] gap-[32px] mt-[48px] max-[600px]:grid-cols-[1fr] max-[900px]:grid-cols-[repeat(2,1fr)] max-[900px]:gap-[20px] [&_article]:flex [&_article]:flex-col [&_article]:[background:#fffdf8] [&_article]:border [&_article]:border-solid [&_article]:border-[#dcd8ca] [&_article]:rounded-[24px] [&_article]:overflow-hidden [&_article]:[transition:transform_.3s_ease,box-shadow_.3s_ease] [&_article:hover]:[transform:translateY(-8px)] [&_article:hover]:shadow-[0_20px_40px_#203c321a] [&_p]:text-[16px] [&_p]:leading-[1.6] [&_p]:text-[#172b22] [&_p]:mb-[20px] [&_p]:italic [&_p]:relative [&_p::before]:content-['“'] [&_p::before]:absolute [&_p::before]:left-[-15px] [&_p::before]:top-[-10px] [&_p::before]:text-[40px] [&_p::before]:opacity-[.1] [&_p::before]:[font-family:serif] [&_strong]:text-[15px] [&_strong]:text-[#172b22] [&_strong]:mt-auto [&_strong]:block [&_small]:text-[13px] [&_small]:text-[#727d6f] [&_small]:mt-[4px] [&_small]:block">
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
                  <span className="inline-block self-start py-[4px] px-[10px] [background:#e9ede2] text-[#2c4a3e] text-[11px] font-semibold uppercase tracking-[.05em] rounded-[6px] mb-[16px]">
                    Пример отзыва
                  </span>
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
      <section
        className="py-[90px] px-[0] max-[570px]:py-[55px] max-[570px]:px-[0] max-[800px]:py-[65px] max-[800px]:px-[0] [&_h2]:[font:400_clamp(38px,4vw,56px)/1.15_Georgia,serif] [&_h2]:tracking-[-.035em] [&_h2]:m-0 [&_h2]:text-[clamp(40px,4.3vw,62px)] [&_h2]:leading-[1.03] max-[570px]:[&_h2]:text-[43px] max-[800px]:[&_h2]:text-[43px] pt-[20px]"
        id="faq"
      >
        <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] gap-[56px] items-start max-[1100px]:gap-[36px] max-[1100px]:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[28px]">
            <div className="sticky top-[124px] max-[900px]:static [&_h2]:mt-[12px] [&_h2]:mb-[16px] [&>p]:m-0 [&>p]:text-hedge [&>p]:text-[16px] [&>p]:leading-[1.75] [&>p]:max-w-[430px] max-[900px]:[&>p]:max-w-none">
              <span className="inline-flex items-center gap-[10px] uppercase tracking-[.17em] text-[13px] font-extrabold text-[#8b492e]">
                Мастерская 3D Бирка
              </span>
              <h2>
                Частые <em>вопросы</em>
              </h2>
              <p>
                Собрали главное о материале, именной 3D-печати, сроках и
                доставке в ваш сад.
              </p>
              <dl className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-[12px] my-[26px] mx-[0] max-[570px]:grid-cols-[1fr] max-[570px]:gap-[8px] max-[570px]:my-[20px] max-[570px]:mx-[0] [&>div]:[background:#fffdf8b8] [&>div]:border [&>div]:border-solid [&>div]:border-[#d8d5c8] [&>div]:rounded-[16px] [&>div]:pt-[14px] [&>div]:pr-[14px] [&>div]:pb-[13px] [&>div]:pl-[14px] [&_dt]:font-[600] [&_dt]:text-[24px] [&_dt]:leading-[1.1] [&_dt]:font-display [&_dt]:text-forest [&_dt]:tracking-[-0.02em] [&_dd]:mt-[6px] [&_dd]:text-[12px] [&_dd]:leading-[1.45] [&_dd]:text-hedge max-[570px]:[&>div]:flex max-[570px]:[&>div]:items-baseline max-[570px]:[&>div]:justify-between max-[570px]:[&>div]:gap-[12px] max-[570px]:[&>div]:py-[12px] max-[570px]:[&>div]:px-[16px] max-[570px]:[&_dt]:text-[21px] max-[570px]:[&_dt]:whitespace-nowrap max-[570px]:[&_dd]:m-0 max-[570px]:[&_dd]:text-right">
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
              <div className="[background:linear-gradient(155deg,#214439,#152e26)] text-[#f4f1e7] border border-solid border-[#b5965c4d] rounded-[22px] p-[24px] shadow-[0_18px_40px_#152e2618] max-[570px]:p-[20px] max-[570px]:rounded-[18px] [&>strong]:block [&>strong]:font-[500] [&>strong]:text-[24px] [&>strong]:leading-[1.2] [&>strong]:font-display [&>strong]:text-[#fbf8f0] [&>strong]:tracking-[-0.015em] [&>p]:mt-[10px] [&>p]:mb-[18px] [&>p]:text-[14px] [&>p]:leading-[1.65] [&>p]:text-[#cbd5c7] max-[570px]:[&>strong]:text-[21px]">
                <strong>Нужен нестандартный размер или совет мастера?</strong>
                <p>
                  Поможем подобрать форму под ваши грядки и кашпо или проверим
                  большой список сортов перед заказом.
                </p>
                <div className="flex flex-wrap items-center gap-[10px]">
                  <ContactLink />
                  {onNavigate && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-[7px] [background:#ffffff12] text-[#f4f1e7] border border-solid border-[#ffffff26] rounded-full py-[10px] px-[16px] min-h-[44px] text-[13px] font-medium [transition:background_0.2s] hover:[background:#ffffff22] [&_svg]:w-[15px] [&_svg]:h-[15px]"
                      onClick={() => onNavigate("constructor")}
                    >
                      Перейти в конструктор <ArrowRight />
                    </button>
                  )}
                </div>
                <Link
                  href={paths.legal.delivery}
                  className="inline-block mt-[16px] text-[12px] text-[#d6c59d] underline [text-underline-offset:4px] hover:text-[#fff8e6]"
                >
                  Подробнее об условиях оплаты, доставки и возврата →
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-[12px] [&_details]:[background:#fffdf8cc] [&_details]:border [&_details]:border-solid [&_details]:border-[#dcd8ca] [&_details]:rounded-[20px] [&_details]:p-0 [&_details]:[transition:background_0.25s,border-color_0.25s,box-shadow_0.25s] [&_details:hover]:border-[#bfb9a4] [&_details:hover]:[background:#fffef9] [&_details[open]]:[background:#fffef9] [&_details[open]]:border-[#a58b5980] [&_details[open]]:shadow-[0_14px_34px_#203c320d] [&_summary]:list-none [&_summary]:grid [&_summary]:grid-cols-[auto_minmax(0,1fr)_auto] [&_summary]:items-center [&_summary]:gap-[16px] [&_summary]:py-[20px] [&_summary]:px-[24px] [&_summary]:cursor-pointer [&_summary]:select-none [&_summary::-webkit-details-marker]:hidden [&_summary:focus-visible]:[outline:3px_solid_#c87d55] [&_summary:focus-visible]:outline-offset-[3px] [&_summary:focus-visible]:rounded-[20px] max-[570px]:[&_summary]:p-[16px] max-[570px]:[&_summary]:gap-[12px]">
              {questions.map((item, index) => (
                <details
                  name="garden-faq"
                  key={item.question}
                  open={index === 0 ? true : undefined}
                >
                  <summary>
                    <span className="w-[38px] h-[38px] rounded-[12px] [background:#ece8dc] border border-solid border-[#d7d2c2] text-[#5b6659] grid place-items-center font-[600] text-[15px] leading-[1] font-display [transition:background_0.25s,color_0.25s,border-color_0.25s] max-[570px]:w-[32px] max-[570px]:h-[32px] max-[570px]:rounded-[10px] max-[570px]:text-[13px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex flex-col gap-[4px] min-w-0 [&_small]:text-[11px] [&_small]:uppercase [&_small]:tracking-[0.12em] [&_small]:text-[#727d6f] [&_small]:font-semibold [&>span]:text-[17px] [&>span]:font-semibold [&>span]:leading-[1.38] [&>span]:text-ink max-[570px]:[&>span]:text-[15px]">
                      <small>{item.category}</small>
                      <span>{item.question}</span>
                    </span>
                    <span
                      className="w-[36px] h-[36px] rounded-full border border-solid border-[#d5d0c0] [background:#f6f3ea] text-forest grid place-items-center [transition:transform_0.25s,background_0.25s,color_0.25s,border-color_0.25s] max-[570px]:w-[32px] max-[570px]:h-[32px] [&_svg]:w-[17px] [&_svg]:h-[17px]"
                      aria-hidden="true"
                    >
                      <Plus />
                    </span>
                  </summary>
                  <div className="pr-[24px] pb-[22px] pl-[78px] max-[570px]:pr-[16px] max-[570px]:pb-[18px] max-[570px]:pl-[16px] [&_p]:m-0 [&_p]:text-[15px] [&_p]:leading-[1.75] [&_p]:text-[#46544b] [&_p]:max-w-[680px] max-[570px]:[&_p]:text-[14px]">
                    <p>{item.answer}</p>
                    <div className="flex flex-wrap gap-[8px] mt-[14px] [&_span]:text-[12px] [&_span]:font-medium [&_span]:text-[#2c4a3e] [&_span]:[background:#e9ede2] [&_span]:border [&_span]:border-solid [&_span]:border-[#d2dac8] [&_span]:rounded-full [&_span]:py-[5px] [&_span]:px-[12px]">
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
      <section
        className="py-[90px] px-[0] max-[570px]:py-[55px] max-[570px]:px-[0] max-[800px]:py-[65px] max-[800px]:px-[0] [&_h2]:[font:400_clamp(38px,4vw,56px)/1.15_Georgia,serif] [&_h2]:tracking-[-.035em] [&_h2]:m-0 [&_h2]:text-[clamp(40px,4.3vw,62px)] [&_h2]:leading-[1.03] max-[570px]:[&_h2]:text-[43px] max-[800px]:[&_h2]:text-[43px] pt-[24px] pb-[100px] max-[570px]:pt-[12px] max-[570px]:pb-[64px]"
        id="newsletter"
      >
        <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
          <div className="relative overflow-hidden rounded-[30px] border border-solid border-[#c9ba96] [background:radial-gradient(ellipse_at_92%_10%,#dce4d0b3,transparent_48%),radial-gradient(ellipse_at_8%_95%,#eadcc680,transparent_46%),linear-gradient(145deg,#fffef9,#f3ede0)] p-[44px] shadow-[0_24px_56px_#203c3210,inset_0_1px_0#ffffffcc] after:content-[''] after:absolute after:inset-[14px] after:border after:border-dashed after:border-[#a58b5938] after:rounded-[22px] after:pointer-events-none max-[1100px]:p-[34px] max-[570px]:py-[22px] max-[570px]:px-[18px] max-[570px]:rounded-[22px] max-[570px]:after:inset-[9px] max-[570px]:after:rounded-[16px]">
            <div className="relative z-[1] grid grid-cols-[minmax(0,1.28fr)_minmax(340px,0.92fr)] gap-[40px] items-stretch max-[1100px]:gap-[28px] max-[1100px]:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.95fr)] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[24px]">
              <div className="flex flex-col [&_h2]:my-[14px] [&_h2]:mx-[0] [&_h2]:text-[clamp(34px,3.6vw,48px)] [&_h2]:leading-[1.1] [&>p]:m-0 [&>p]:text-hedge [&>p]:text-[16px] [&>p]:leading-[1.7] [&>p]:max-w-[580px] max-[900px]:[&>p]:max-w-none max-[570px]:[&_h2]:text-[32px] max-[570px]:[&>p]:text-[14px]">
                <div className="flex flex-wrap items-center gap-[12px]">
                  <span className="inline-flex items-center gap-[10px] uppercase tracking-[.17em] text-[13px] font-extrabold text-[#8b492e]">
                    Продолжение вашей коллекции
                  </span>
                  <span className="inline-flex items-center gap-[6px] py-[5px] px-[12px] rounded-full [background:#e6ece0] border border-solid border-[#cdd8c3] text-forest text-[11px] font-semibold tracking-[0.02em] [&_svg]:w-[13px] [&_svg]:h-[13px] [&_svg]:text-brass">
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

                <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[14px] mt-[24px] max-[570px]:grid-cols-[1fr] max-[570px]:gap-[12px] max-[570px]:mt-[18px]">
                  {upcomingItems.map((item) => (
                    <article
                      key={item.id}
                      className="[background:#fffdf8d9] border border-solid border-[#dcd6c4] rounded-[20px] py-[18px] px-[20px] flex flex-col shadow-[0_8px_22px_#203c3208] [transition:border-color_0.25s_ease,transform_0.25s_ease,box-shadow_0.25s_ease] hover:border-[#b7a379] hover:[transform:translateY(-2px)] hover:shadow-[0_14px_30px_#203c3212] max-[570px]:p-[16px] max-[570px]:rounded-[16px] [&_h3]:font-[600] [&_h3]:text-[22px] [&_h3]:leading-[1.18] [&_h3]:font-display [&_h3]:text-ink [&_h3]:m-0 [&_h3]:tracking-[-0.015em] [&>small]:block [&>small]:mt-[3px] [&>small]:text-[12px] [&>small]:font-semibold [&>small]:text-forest [&>p]:mt-[10px] [&>p]:mb-[14px] [&>p]:text-[13px] [&>p]:leading-[1.6] [&>p]:text-[#4b584f] [&>p]:flex-[1]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[12px]">
                        <div
                          className="w-[46px] h-[46px] rounded-[14px] [background:radial-gradient(circle_at_30%_25%,#f4efe2,#e2e7d8)] border border-solid border-[#ced6c3] text-forest grid place-items-center shrink-0 [&_svg]:w-[26px] [&_svg]:h-[26px]"
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
                        <div className="flex items-center gap-[8px]">
                          <span className="inline-flex items-center py-[4px] px-[10px] rounded-full [background:#f2ecde] border border-solid border-[#dfd5bf] text-[#655233] text-[11px] font-semibold tracking-[0.02em]">
                            {item.badge}
                          </span>
                          <span className="font-[600] text-[13px] leading-[1] font-display text-[#7d8678]">
                            № {item.num}
                          </span>
                        </div>
                      </div>
                      <h3>{item.title}</h3>
                      <small>{item.subtitle}</small>
                      <p>{item.description}</p>
                      <div className="flex flex-wrap gap-[6px] mt-auto [&_span]:py-[4px] [&_span]:px-[10px] [&_span]:rounded-[8px] [&_span]:[background:#eff2e9] [&_span]:border [&_span]:border-solid [&_span]:border-[#d8e0cf] [&_span]:text-[#2f473c] [&_span]:text-[11px] [&_span]:font-semibold">
                        {item.specs.map((spec) => (
                          <span key={spec}>{spec}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-[18px] py-[12px] px-[16px] rounded-[16px] [background:#fffdf8b3] border border-solid border-[#ded9c9] flex flex-wrap items-center gap-[12px] text-[13px] text-[#4a574e] max-[570px]:py-[11px] max-[570px]:px-[14px] max-[570px]:text-[12px] [&_strong]:text-forest [&_strong]:font-bold">
                  <div
                    className="inline-flex items-center [&_span]:w-[22px] [&_span]:h-[22px] [&_span]:rounded-full [&_span]:border-[1.5px] [&_span]:border-solid [&_span]:shadow-[0_2px_5px_#00000014]"
                    aria-hidden="true"
                  >
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

              <div className="[background:radial-gradient(ellipse_at_85%_0%,#315e4e80,transparent_55%),linear-gradient(160deg,#214539,#132b23)] text-[#f5f1e7] border border-solid border-[#b5965c59] rounded-[24px] py-[30px] px-[28px] flex flex-col justify-between shadow-[0_22px_48px_#132b2324] max-[570px]:py-[22px] max-[570px]:px-[18px] max-[570px]:rounded-[18px]">
                <div className="flex items-start gap-[14px] [&_strong]:block [&_strong]:font-[500] [&_strong]:text-[24px] [&_strong]:leading-[1.18] [&_strong]:font-display [&_strong]:text-[#fbf8f0] [&_strong]:tracking-[-0.015em] [&_span]:block [&_span]:mt-[4px] [&_span]:text-[13px] [&_span]:text-[#c4d0c2] max-[570px]:[&_strong]:text-[21px]">
                  <span
                    className="w-[44px] h-[44px] rounded-[14px] [background:#e4cf9f1f] border border-solid border-[#e4cf9f4d] text-[#e4cf9f] grid place-items-center shrink-0 [&_svg]:w-[20px] [&_svg]:h-[20px]"
                    aria-hidden="true"
                  >
                    <BellRing />
                  </span>
                  <div>
                    <strong>Лист ожидания первого тиража</strong>
                    <span>Напишем один раз, когда откроем предзаказ</span>
                  </div>
                </div>

                <ul className="list-none my-[20px] mx-[0] py-[16px] px-[0] border-top-[1px] border-top-[#ffffff17] border-bottom-[1px] border-bottom-[#ffffff17] flex flex-col gap-[10px] [&_li]:flex [&_li]:items-start [&_li]:gap-[10px] [&_li]:text-[13px] [&_li]:leading-[1.5] [&_li]:text-[#dce4d9]">
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

                <form
                  onSubmit={subscribe}
                  className="flex flex-col gap-[10px] [&>label:first-child]:text-[12px] [&>label:first-child]:font-semibold [&>label:first-child]:tracking-[0.08em] [&>label:first-child]:uppercase [&>label:first-child]:text-[#d6c59d]"
                >
                  <label htmlFor="newsletter-email">Электронная почта</label>
                  <div className="[&_input]:w-full [&_input]:min-h-[52px] [&_input]:py-[13px] [&_input]:px-[16px] [&_input]:rounded-[14px] [&_input]:border [&_input]:border-solid [&_input]:border-[#ffffff29] [&_input]:[background:#ffffff12] [&_input]:text-[#fbf8f0] [&_input]:text-[15px] [&_input]:[transition:border-color_0.2s,background_0.2s] [&_input::placeholder]:text-[#9fb0a4] [&_input:focus]:[background:#ffffff1c] [&_input:focus]:border-[#e4cf9f]">
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
                      className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
                      disabled={pending}
                    >
                      {pending ? "Отправляем…" : "Сообщить о новинках"}
                    </button>
                  </div>
                  <label className="[&_input]:w-[16px] [&_input]:h-[16px] [&_input]:mt-[2px] [&_input]:[accent-color:#e4cf9f] [&_input]:shrink-0 [&_input]:cursor-pointer">
                    <input type="checkbox" name="consent" required />
                    <span>
                      Согласен получать письма о новинках 3D Бирка на указанную
                      почту. Без спама — отписка в один клик.
                    </span>
                  </label>
                  <p
                    role="status"
                    aria-live="polite"
                    className={`m-0 min-h-[20px] text-[13px] leading-[1.45] text-[#fadbd2] py-[10px] px-[13px] rounded-[12px] [background:#5c281e73] border border-solid border-[#ffffff24] border-[#e29b8759] ${status ? (statusOk ? "is-success" : "is-error") : ""}`}
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
