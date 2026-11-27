"use client";

import { motion } from "framer-motion";
import {
  ChevronDown,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import {
  getPaletteForShape,
  getShapeEntry,
  type Preset,
  presets,
  shapeToSeries,
} from "./data";
import { type Category, money } from "./shared";
import { calculateKit } from "./tag-config";
import { LabelPreview, Pill } from "./ui";

const filters: [Category, string][] = [
  ["all", "Все"],
  ["collections", "Авторские серии"],
  ["seedling", "Для рассады · 10 см"],
  ["garden", "Для грядок · 18 см"],
  ["greenhouse", "В теплицу · 8 см"],
  ["large", "Большие наборы −15%"],
];

function pluralizeVarieties(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} сорт`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} сорта`;
  }
  return `${count} сортов`;
}

function matchesCategory(kit: Preset, category: Category): boolean {
  if (category === "all") return true;
  if (category === "collections") {
    return Boolean(kit.series && kit.series !== "classic");
  }
  if (category === "large") return kit.items.length >= 30;
  return (
    !kit.mixed &&
    shapeToSeries(kit.shape) === "classic" &&
    kit.shape ===
      (
        {
          seedling: "stake",
          garden: "flag",
          greenhouse: "hanging",
        } as const
      )[category]
  );
}

export function CatalogSection({
  category,
  onCategoryChange,
  onApplyPreset,
  onAddPreset,
}: {
  category: Category;
  onCategoryChange: (category: Category) => void;
  onApplyPreset: (preset: Preset) => void;
  onAddPreset: (preset: Preset) => void;
}) {
  const visiblePresets = presets.filter((kit) =>
    matchesCategory(kit, category),
  );
  const collectionShowcase = presets.filter(
    (kit) => kit.series && kit.series !== "classic" && kit.coverImage,
  );

  return (
    <section
      id="catalog"
      className="py-[90px] px-[0] max-[570px]:py-[55px] max-[570px]:px-[0] max-[800px]:py-[65px] max-[800px]:px-[0] [&_h2]:[font:400_clamp(38px,4vw,56px)/1.15_Georgia,serif] [&_h2]:tracking-[-.035em] [&_h2]:m-0 [&_h2]:text-[clamp(40px,4.3vw,62px)] [&_h2]:leading-[1.03] max-[570px]:[&_h2]:text-[43px] max-[800px]:[&_h2]:text-[43px] [background:transparent]"
    >
      <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
        <div className="flex justify-between items-center gap-[50px] mb-[36px] max-[570px]:block max-[570px]:mb-[26px] max-[800px]:flex max-[800px]:gap-[24px] [&>p]:max-w-[370px] [&>p]:text-[#b0bdb2] [&>p]:text-[15px] [&>p]:mb-[5px] [&>p]:leading-[1.8] max-[800px]:[&>p]:mt-[18px] max-[800px]:[&>p]:text-[13px] max-[800px]:[&>p]:m-0 max-[800px]:[&>p]:max-w-[240px] max-[570px]:[&>p]:text-[15px] max-[570px]:[&>p]:mt-[18px] max-[570px]:[&>p]:max-w-none">
          <div>
            <span className="inline-flex items-center gap-[10px] uppercase tracking-[.17em] text-[13px] font-extrabold text-[#8b492e]">
              Каталог мастерской
            </span>
            <h2>
              Готовые наборы и <em>авторские коллекции</em>
            </h2>
          </div>
          <p>
            Грифельная классика, детские фигурки, французский Прованс и базовые
            наборы. Любое название можно заменить в один клик перед заказом.
          </p>
        </div>

        {(category === "all" || category === "collections") && (
          <section
            className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-[22px] mb-[34px] max-[640px]:grid-cols-[1fr] max-[640px]:gap-[16px] max-[960px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[960px]:gap-[18px]"
            aria-label="Авторские коллекции садовых табличек"
          >
            {collectionShowcase.map((kit) => {
              const { price } = calculateKit(
                kit.items.length,
                kit.shape,
                kit.mixed,
              );
              return (
                <article
                  className="[background:#fffdf8] border border-solid border-[#d7d1c0] rounded-[24px] overflow-hidden flex flex-col shadow-[0_14px_34px_#203c320d] [transition:transform_0.28s_ease,box-shadow_0.28s_ease,border-color_0.28s_ease] hover:[transform:translateY(-4px)] hover:border-[#b7a47e] hover:shadow-[0_22px_44px_#203c3217]"
                  key={kit.title}
                >
                  <div className="relative aspect-[3/2] overflow-hidden [background:#233329] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:[transition:transform_0.55s_cubic-bezier(0.22,1,0.36,1)] [&_img]:[transform:scale(1.04)]">
                    {kit.coverImage && (
                      <Image
                        src={kit.coverImage}
                        alt={kit.title}
                        width={1024}
                        height={682}
                      />
                    )}
                    <span className="absolute bottom-[12px] py-[5px] px-[12px] rounded-full text-[11px] font-bold [backdrop-filter:blur(10px)] left-[14px] [background:#172b22cc] text-[#f6ebd2] border border-solid border-[#ffffff24]">
                      {kit.badge ?? "Авторская серия"}
                    </span>
                    <span className="absolute bottom-[12px] py-[5px] px-[12px] rounded-full text-[11px] font-bold [backdrop-filter:blur(10px)] right-[14px] [background:#fffef9e0] text-[#1f352b]">
                      {kit.items.length} табличек
                    </span>
                  </div>
                  <div className="pt-[20px] pr-[22px] pb-[22px] pl-[22px] flex flex-col flex-[1] [&_h3]:font-[600] [&_h3]:text-[25px] [&_h3]:leading-[1.16] [&_h3]:font-display [&_h3]:text-ink [&_h3]:mb-[8px] [&_h3]:tracking-[-0.02em] [&>p]:mb-[18px] [&>p]:text-[14px] [&>p]:leading-[1.55] [&>p]:text-hedge [&>p]:flex-[1]">
                    <h3>{kit.title}</h3>
                    {kit.subtitle && <p>{kit.subtitle}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-[12px] pt-[14px] border-top-[1px] border-top-[#eae5d8] [&_strong]:block [&_strong]:font-[700] [&_strong]:text-[22px] [&_strong]:leading-[1.1] [&_strong]:font-craft [&_strong]:text-ink [&_strong]:tracking-[-0.02em] [&_small]:block [&_small]:text-[11px] [&_small]:text-[#6c776a] [&_small]:mt-[2px]">
                      <div>
                        <strong>{money(price)} ₽</strong>
                        <small>за набор · или свои сорта в 3D</small>
                      </div>
                      <div className="inline-flex items-center gap-[8px]">
                        <button
                          type="button"
                          className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
                          onClick={() => onApplyPreset(kit)}
                        >
                          <SlidersHorizontal aria-hidden="true" />В 3D-студию
                        </button>
                        <button
                          type="button"
                          className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#ffffffeb] text-forest border-[#ffffff6b] hover:[background:white]"
                          aria-label={`Добавить «${kit.title}» в корзину`}
                          onClick={() => onAddPreset(kit)}
                        >
                          <ShoppingBag aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-[16px] mb-[32px] max-[570px]:items-stretch max-[570px]:gap-[12px] max-[570px]:mb-[24px]">
          <fieldset
            className="inline-flex flex-wrap gap-[4px] mb-[30px] border-0 min-w-0 p-[5px] [background:#e9ebe2] rounded-full max-[570px]:w-full max-[570px]:gap-[0] max-[570px]:p-[4px] [&_button]:border-0 [&_button]:[background:transparent] [&_button]:text-[#465347] [&_button]:rounded-full [&_button]:py-[9px] [&_button]:px-[18px] [&_button]:min-h-[44px] [&_button]:font-semibold [&_button]:text-[14px] [&_button]:relative [&_button]:isolate [&_button]:[transition:color_0.2s] max-[570px]:[&_button]:py-[8px] max-[570px]:[&_button]:px-[12px] max-[570px]:[&_button]:text-[13px] max-[570px]:[&_button]:flex-[1_1_auto] max-[570px]:[&_button]:min-h-[40px] [&_button:hover]:text-forest"
            aria-label="Категории"
          >
            {filters.map(([id, title]) => (
              <button
                type="button"
                key={id}
                className={category === id ? "active" : ""}
                aria-pressed={category === id}
                onClick={() => onCategoryChange(id)}
              >
                <Pill active={category === id} group="catalog" />
                {title}
              </button>
            ))}
          </fieldset>
          <div className="inline-flex flex-wrap items-center gap-[8px] max-[570px]:w-full [&>span]:inline-flex [&>span]:items-center [&>span]:gap-[6px] [&>span]:py-[8px] [&>span]:px-[13px] [&>span]:rounded-full [&>span]:[background:#fffdf8b8] [&>span]:border [&>span]:border-solid [&>span]:border-[#dcd8ca] [&>span]:text-[12px] [&>span]:font-medium [&>span]:text-[#4d5a4f] [&>span]:whitespace-nowrap max-[570px]:[&>span]:flex-[1_1_auto] max-[570px]:[&>span]:justify-center max-[570px]:[&>span]:text-[11px] max-[570px]:[&>span]:py-[7px] max-[570px]:[&>span]:px-[10px]">
            <span>
              <Sparkles aria-hidden="true" />
              От 15 шт. — <strong>−10%</strong>
            </span>
            <span>
              От 30 шт. — <strong>−15%</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-[24px] items-stretch max-[1100px]:gap-[18px] max-[570px]:grid-cols-[1fr] max-[570px]:gap-[20px] max-[800px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[800px]:gap-[28px_20px] max-[900px]:grid-cols-[repeat(2,minmax(0,1fr))]">
          {visiblePresets.map((preset, index) => {
            const { price, original, discount } = calculateKit(
              preset.items.length,
              preset.shape,
              preset.mixed,
            );
            const form = getShapeEntry(preset.shape);
            const colorPair = getPaletteForShape(preset.shape, preset.color);
            const previewItems = preset.items.slice(0, 6);
            const extraItems = preset.items.slice(6);
            const isFeatured = Boolean(preset.mixed);
            const isThemed = shapeToSeries(preset.shape) !== "classic";
            const showDuo = isFeatured || isThemed;
            const unitPrice = money(
              Math.round((price / preset.items.length) * 100) / 100,
            );

            return (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className={`[background:#fffdf8] border border-solid border-[#dcd8ca] rounded-[24px] overflow-hidden flex flex-col shadow-[0_10px_28px_#203c3208] [transition:border-color_0.25s_ease,box-shadow_0.25s_ease] hover:border-[#bfb8a2] hover:shadow-[0_22px_44px_#203c3214] [&_h3]:font-[600] [&_h3]:text-[28px] [&_h3]:leading-[1.15] [&_h3]:font-display [&_h3]:mt-[6px] [&_h3]:mb-[14px] [&_h3]:text-[32px] [&_h3]:text-ink [&_h3]:tracking-[-0.02em] [&_p]:text-[#67705f] [&_p]:text-[16px] [&_p]:mb-[26px] [&_p]:flex-[1] [&_p]:mb-[20px] [&_p]:leading-[1.7] max-[1150px]:[&_h3]:text-[29px] max-[570px]:[&_h3]:text-[26px] max-[570px]:[&_p]:text-[15px] max-[1100px]:[&_h3]:text-[25px] ${isFeatured ? "col-[1/-1] grid grid-cols-[minmax(280px,0.92fr)_minmax(0,1.35fr)] [background:linear-gradient(145deg,#fffef9,#f7f3e8)] border-[#c7b58e] shadow-[0_16px_40px_#203c3210] max-[900px]:grid-cols-[1fr] [&_h3]:text-[33px] [&_h3]:mt-[6px] [&_h3]:mb-[14px] max-[900px]:[&_h3]:text-[28px] max-[570px]:[&_h3]:text-[26px]" : ""} ${isThemed ? `birka-product-series-${shapeToSeries(preset.shape)}` : ""}`}
                key={preset.title}
              >
                <div
                  className={`relative h-[244px] flex place-items-center [background:radial-gradient(ellipse_at_50%_32%,#f4f2e7,#dfe1d2)] rounded-none overflow-hidden border-bottom-[1px] border-bottom-[#e6e2d5] flex-col justify-between p-[16px] after:content-[''] after:absolute after:inset-[22px] after:border after:border-dashed after:border-[#23483e18] after:rounded-[20px] after:pointer-events-none max-[1150px]:h-[260px] max-[570px]:h-[236px] max-[570px]:min-h-[236px] max-[800px]:h-[250px] birka-art-${index % 3}`}
                >
                  <div className="relative z-[2] flex items-center justify-between gap-[8px] w-full">
                    <span
                      className={`static left-[17px] top-[17px] [background:#fffef9e6] text-forest rounded-full py-[5px] px-[12px] text-[11px] font-bold z-[1] [backdrop-filter:blur(8px)] inline-flex items-center border border-solid border-[#203c3214] tracking-[0.02em] ${discount > 0 ? "[background:#23483e] border-forest text-[#f4e6c8]" : ""}`}
                    >
                      {preset.badge ??
                        (discount
                          ? `Выгода ${discount}%`
                          : preset.shape === "stake"
                            ? "Для подоконника"
                            : preset.shape === "hanging"
                              ? "В теплицу"
                              : "Для грядок")}
                    </span>
                    <span className="inline-flex items-center [background:#203c3212] [backdrop-filter:blur(6px)] text-ink rounded-full py-[5px] px-[11px] text-[11px] font-bold tracking-[0.03em]">
                      {preset.items.length} шт.
                    </span>
                  </div>

                  <div
                    className={`absolute inset-0 grid place-items-center pointer-events-none z-[1]`}
                  >
                    <LabelPreview
                      shape={preset.shape}
                      color={preset.color}
                      name={preset.items[0] ?? ""}
                      itemIndex={0}
                      small
                    />
                    {showDuo && (
                      <LabelPreview
                        shape={isFeatured ? "flag" : preset.shape}
                        color={preset.color}
                        name={preset.items[1] ?? preset.items[0] ?? ""}
                        itemIndex={1}
                        small
                      />
                    )}
                  </div>

                  <div className="relative z-[2] flex items-center justify-between gap-[8px] w-full">
                    <span className="inline-flex items-center gap-[6px] [background:#fffef9d9] [backdrop-filter:blur(8px)] border border-solid border-[#203c3214] rounded-full py-[4px] px-[10px] text-[11px] font-semibold text-[#36453b]">
                      {preset.mixed
                        ? "Колышек 10 см + Флажок 18 см"
                        : `${form.title} · ${form.size}`}
                    </span>
                    <span
                      className="inline-flex items-center gap-[6px] [background:#fffef9d9] [backdrop-filter:blur(8px)] border border-solid border-[#203c3214] rounded-full py-[4px] px-[10px] text-[11px] font-semibold text-[#36453b]"
                      title={`${colorPair.name} — ${colorPair.label.toLowerCase()}`}
                    >
                      <span
                        className="w-[11px] h-[11px] rounded-full border-[1.5px] border-solid border-[currentColor] shrink-0"
                        style={{
                          background: colorPair.base,
                          borderColor: colorPair.ink,
                        }}
                        aria-hidden="true"
                      />
                      {colorPair.name}
                    </span>
                  </div>
                </div>

                <div className="pt-[20px] pr-[22px] pb-[22px] pl-[22px] flex flex-col flex-[1] gap-[0] max-[1100px]:p-[18px] max-[570px]:pt-[20px] max-[570px]:p-[18px]">
                  <span className="text-[10px] uppercase tracking-[0.11em] text-[#727d6e] font-semibold max-[570px]:text-[11px]">
                    {preset.mixed
                      ? "Микс 10 см + 18 см"
                      : `${form.title} · ${form.size}`}{" "}
                    · {preset.items.length} шт. · {colorPair.name}
                    {preset.mixed && " · Скидка 15%"}
                  </span>

                  <h3>{preset.title}</h3>

                  <div className="flex flex-col gap-[8px] mb-[18px] flex-[1]">
                    <ul
                      className="list-none m-0 p-0 flex flex-wrap gap-[6px]"
                      aria-label={`Сорта в наборе «${preset.title}»`}
                    >
                      {previewItems.map((item) => (
                        <li
                          key={item}
                          className="inline-flex items-center py-[4px] px-[10px] rounded-[8px] [background:#f3f0e6] border border-solid border-[#e2ddd0] text-[#2f3e35] text-[12px] font-medium leading-[1.35]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>

                    {extraItems.length > 0 && (
                      <details className="mt-[2px] [&_summary]:list-none [&_summary]:inline-flex [&_summary]:items-center [&_summary]:gap-[5px] [&_summary]:py-[4px] [&_summary]:px-[10px] [&_summary]:rounded-[8px] [&_summary]:[background:#e8ede2] [&_summary]:border [&_summary]:border-solid [&_summary]:border-[#d1dac7] [&_summary]:text-forest [&_summary]:text-[12px] [&_summary]:font-semibold [&_summary]:cursor-pointer [&_summary]:select-none [&_summary]:[transition:background_0.2s,border-color_0.2s] [&_summary::-webkit-details-marker]:hidden [&_summary:hover]:[background:#dfe7d7] [&_summary:hover]:border-[#bcc8b0]">
                        <summary>
                          <span>
                            + ещё {pluralizeVarieties(extraItems.length)}
                          </span>
                          <ChevronDown aria-hidden="true" />
                        </summary>
                        <ul className="list-none m-0 p-0 flex flex-wrap gap-[6px] mt-[8px] pt-[8px] border-top-[1px] border-top-[#e2ddd0]">
                          {extraItems.map((item) => (
                            <li
                              key={item}
                              className="inline-flex items-center py-[4px] px-[10px] rounded-[8px] [background:#f3f0e6] border border-solid border-[#e2ddd0] text-[#2f3e35] text-[12px] font-medium leading-[1.35]"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between gap-[12px] border-top-[1px] border-top-[#e8e4d8] pt-[14px] border-[#d8dccf] flex-row mt-auto max-[1100px]:items-start max-[1100px]:flex-col max-[1150px]:items-start max-[1150px]:gap-[12px] max-[570px]:flex-row max-[570px]:items-center max-[800px]:flex-col [&_strong]:font-[700] [&_strong]:text-[24px] [&_strong]:leading-[1.1] [&_strong]:font-craft [&_strong]:whitespace-nowrap [&_strong]:tracking-[-0.03em] [&_strong]:text-ink [&_button]:border-0 [&_button]:[background:none] [&_button]:text-forest [&_button]:flex [&_button]:items-center [&_button]:gap-[6px] [&_button]:text-[14px] [&_button]:font-semibold [&_button]:text-right [&_button:hover]:underline [&_svg]:w-[15px] [&_svg]:h-[18px] max-[570px]:[&_button]:text-[14px] max-[1150px]:[&_button]:max-w-[130px] max-[800px]:[&_button]:max-w-none max-[570px]:[&_strong]:text-[22px] [&_del]:text-[14px] [&_del]:text-[#8c9488] [&_del]:[text-decoration:line-through] [&_small]:text-[12px] [&_small]:text-[#6b7669] [&_small]:leading-[1.4]">
                    <div className="flex flex-col gap-[3px] w-full">
                      <div className="flex items-baseline flex-wrap gap-[8px]">
                        <strong>{money(price)} ₽</strong>
                        {discount > 0 && <del>{money(original)} ₽</del>}
                        {discount > 0 && (
                          <span className="inline-flex items-center py-[2px] px-[8px] rounded-full [background:#e5ede0] text-forest text-[11px] font-bold">
                            −{discount}%
                          </span>
                        )}
                      </div>
                      <small>
                        {unitPrice} ₽ / шт. · можно изменить любой сорт
                      </small>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.25fr_1fr] gap-[8px] mt-[14px] max-[1100px]:grid-cols-[1fr] max-[570px]:grid-cols-[1.2fr_1fr]">
                    <button
                      className="min-h-[46px] py-[10px] px-[14px] rounded-[14px] inline-flex items-center justify-center gap-[7px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[13px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
                      type="button"
                      onClick={() => onApplyPreset(preset)}
                    >
                      <SlidersHorizontal aria-hidden="true" />
                      Настроить список
                    </button>
                    <button
                      className="min-h-[46px] py-[10px] px-[14px] rounded-[14px] inline-flex items-center justify-center gap-[7px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[13px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#ffffffeb] text-forest border-[#ffffff6b] hover:[background:white]"
                      type="button"
                      onClick={() => onAddPreset(preset)}
                    >
                      <ShoppingBag aria-hidden="true" />В корзину
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
