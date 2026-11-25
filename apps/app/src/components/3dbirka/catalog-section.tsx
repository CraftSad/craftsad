"use client";

import { motion } from "framer-motion";
import { colorPairs, type Preset, presets, shapes } from "./data";
import { type Category, money } from "./shared";
import { calculateKit } from "./tag-config";
import { LabelPreview, Pill } from "./ui";

const filters: [Category, string][] = [
  ["all", "Все"],
  ["seedling", "Для рассады · 10 см"],
  ["garden", "Для грядок · 18 см"],
  ["greenhouse", "В теплицу · 8 см"],
  ["large", "Большие наборы −15%"],
];
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
  return (
    <section id="catalog" className="birka-section birka-catalog">
      <div className="birka-container">
        <div className="birka-section-top">
          <div>
            <h2>
              Готовые наборы с запасом под <em>популярные сорта</em>
            </h2>
          </div>
          <p>
            Собрали проверенные сочетания для рассады, теплицы и грядок. Любое
            название можно заменить в один клик перед заказом.
          </p>
        </div>
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
        <div className="birka-products">
          {presets
            .filter(
              (kit) =>
                category === "all" ||
                (category === "large"
                  ? kit.items.length >= 30
                  : !kit.mixed &&
                    kit.shape ===
                      (
                        {
                          seedling: "stake",
                          garden: "flag",
                          greenhouse: "hanging",
                        } as const
                      )[category]),
            )
            .map((preset, index) => {
              const { price, original, discount } = calculateKit(
                preset.items.length,
                preset.shape,
                preset.mixed,
              );
              const form = shapes.find((item) => item.id === preset.shape);
              return (
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="birka-product"
                  key={preset.title}
                >
                  <div className={`birka-product-art birka-art-${index % 3}`}>
                    <span className="birka-product-badge">
                      {preset.badge ??
                        (discount
                          ? `Выгода ${discount}%`
                          : preset.shape === "stake"
                            ? "Для подоконника"
                            : preset.shape === "hanging"
                              ? "В теплицу"
                              : "Для грядок")}
                    </span>
                    <LabelPreview
                      shape={preset.shape}
                      color={preset.color}
                      name={preset.items[0] ?? ""}
                      small
                    />
                  </div>
                  <div className="birka-product-body">
                    <span className="birka-product-category">
                      {preset.mixed
                        ? "Микс 10 см + 18 см"
                        : `${form?.title} · ${form?.size}`}{" "}
                      · {preset.items.length} шт. ·{" "}
                      {colorPairs[preset.color]?.name}
                      {preset.mixed && " · Скидка 15%"}
                    </span>
                    <h3>{preset.title}</h3>
                    <p>{preset.items.slice(0, 6).join(", ")}</p>
                    {preset.items.length > 6 && (
                      <details className="birka-kit-list">
                        <summary>
                          + ещё {preset.items.length - 6} сортов
                        </summary>
                        <p>{preset.items.slice(6).join(", ")}</p>
                      </details>
                    )}
                    <div className="birka-product-footer">
                      <div>
                        {discount > 0 && <del>{money(original)} ₽</del>}{" "}
                        <strong>{money(price)} ₽</strong>
                        <small>
                          {money(
                            Math.round((price / preset.items.length) * 100) /
                              100,
                          )}{" "}
                          ₽ / шт.
                        </small>
                      </div>
                    </div>
                    <div className="birka-kit-actions">
                      <button
                        className="birka-button birka-button-primary"
                        type="button"
                        onClick={() => onApplyPreset(preset)}
                      >
                        Настроить список
                      </button>
                      <button
                        className="birka-button birka-button-light"
                        type="button"
                        onClick={() => onAddPreset(preset)}
                      >
                        В корзину
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
