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
    <section id="catalog" className="birka-section birka-catalog">
      <div className="birka-container">
        <div className="birka-section-top">
          <div>
            <span className="birka-eyebrow">Каталог мастерской</span>
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
            className="birka-series-showcase"
            aria-label="Авторские коллекции садовых табличек"
          >
            {collectionShowcase.map((kit) => {
              const { price } = calculateKit(
                kit.items.length,
                kit.shape,
                kit.mixed,
              );
              return (
                <article className="birka-series-card" key={kit.title}>
                  <div className="birka-series-card-media">
                    {kit.coverImage && (
                      <Image
                        src={kit.coverImage}
                        alt={kit.title}
                        width={1024}
                        height={682}
                      />
                    )}
                    <span className="birka-series-card-badge">
                      {kit.badge ?? "Авторская серия"}
                    </span>
                    <span className="birka-series-card-count">
                      {kit.items.length} табличек
                    </span>
                  </div>
                  <div className="birka-series-card-body">
                    <h3>{kit.title}</h3>
                    {kit.subtitle && <p>{kit.subtitle}</p>}
                    <div className="birka-series-card-footer">
                      <div>
                        <strong>{money(price)} ₽</strong>
                        <small>за набор · или свои сорта в 3D</small>
                      </div>
                      <div className="birka-series-card-actions">
                        <button
                          type="button"
                          className="birka-button birka-button-primary"
                          onClick={() => onApplyPreset(kit)}
                        >
                          <SlidersHorizontal aria-hidden="true" />В 3D-студию
                        </button>
                        <button
                          type="button"
                          className="birka-button birka-button-light"
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

        <div className="birka-catalog-toolbar">
          <fieldset className="birka-filters" aria-label="Категории">
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
          <div className="birka-catalog-perks">
            <span>
              <Sparkles aria-hidden="true" />
              От 15 шт. — <strong>−10%</strong>
            </span>
            <span>
              От 30 шт. — <strong>−15%</strong>
            </span>
          </div>
        </div>

        <div className="birka-products">
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
                className={`birka-product ${isFeatured ? "birka-product-featured" : ""} ${isThemed ? `birka-product-series-${shapeToSeries(preset.shape)}` : ""}`}
                key={preset.title}
              >
                <div className={`birka-product-art birka-art-${index % 3}`}>
                  <div className="birka-product-art-top">
                    <span
                      className={`birka-product-badge ${discount > 0 ? "birka-product-badge-discount" : ""}`}
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
                    <span className="birka-product-count">
                      {preset.items.length} шт.
                    </span>
                  </div>

                  <div
                    className={`birka-product-stage ${showDuo ? "birka-product-stage-duo" : ""}`}
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

                  <div className="birka-product-art-bottom">
                    <span className="birka-product-shape-chip">
                      {preset.mixed
                        ? "Колышек 10 см + Флажок 18 см"
                        : `${form.title} · ${form.size}`}
                    </span>
                    <span
                      className="birka-product-color-chip"
                      title={`${colorPair.name} — ${colorPair.label.toLowerCase()}`}
                    >
                      <span
                        className="birka-product-color-dot"
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

                <div className="birka-product-body">
                  <span className="birka-product-category">
                    {preset.mixed
                      ? "Микс 10 см + 18 см"
                      : `${form.title} · ${form.size}`}{" "}
                    · {preset.items.length} шт. · {colorPair.name}
                    {preset.mixed && " · Скидка 15%"}
                  </span>

                  <h3>{preset.title}</h3>

                  <div className="birka-kit-tags-wrap">
                    <ul
                      className="birka-kit-tags"
                      aria-label={`Сорта в наборе «${preset.title}»`}
                    >
                      {previewItems.map((item) => (
                        <li key={item} className="birka-kit-tag">
                          {item}
                        </li>
                      ))}
                    </ul>

                    {extraItems.length > 0 && (
                      <details className="birka-kit-list">
                        <summary>
                          <span>
                            + ещё {pluralizeVarieties(extraItems.length)}
                          </span>
                          <ChevronDown aria-hidden="true" />
                        </summary>
                        <ul className="birka-kit-tags birka-kit-tags-more">
                          {extraItems.map((item) => (
                            <li key={item} className="birka-kit-tag">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>

                  <div className="birka-product-footer">
                    <div className="birka-product-price">
                      <div className="birka-product-price-main">
                        <strong>{money(price)} ₽</strong>
                        {discount > 0 && <del>{money(original)} ₽</del>}
                        {discount > 0 && (
                          <span className="birka-product-save">
                            −{discount}%
                          </span>
                        )}
                      </div>
                      <small>
                        {unitPrice} ₽ / шт. · можно изменить любой сорт
                      </small>
                    </div>
                  </div>

                  <div className="birka-kit-actions">
                    <button
                      className="birka-button birka-button-primary"
                      type="button"
                      onClick={() => onApplyPreset(preset)}
                    >
                      <SlidersHorizontal aria-hidden="true" />
                      Настроить список
                    </button>
                    <button
                      className="birka-button birka-button-light"
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
