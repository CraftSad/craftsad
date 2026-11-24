"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { type Preset, presets, shapes } from "./data";
import { type Category, money } from "./shared";
import { LabelPreview, Pill } from "./ui";

export function CatalogSection({
  category,
  onCategoryChange,
  onApplyPreset,
}: {
  category: Category;
  onCategoryChange: (category: Category) => void;
  onApplyPreset: (preset: Preset) => void;
}) {
  return (
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
            onClick={() => onCategoryChange("all")}
          >
            <Pill active={category === "all"} group="catalog" />
            Все наборы
          </button>
          <button
            type="button"
            className={category === "seedling" ? "active" : ""}
            onClick={() => onCategoryChange("seedling")}
          >
            <Pill active={category === "seedling"} group="catalog" />
            Для рассады
          </button>
          <button
            type="button"
            className={category === "garden" ? "active" : ""}
            onClick={() => onCategoryChange("garden")}
          >
            <Pill active={category === "garden"} group="catalog" />
            Для грядок
          </button>
        </fieldset>
        <div className="birka-products">
          {presets
            .filter(
              (preset) => category === "all" || preset.category === category,
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
                <div className={`birka-product-art birka-art-${index % 3}`}>
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
                    · {shapes.find((item) => item.id === preset.shape)?.size}
                  </span>
                  <h3>{preset.title}</h3>
                  <p>
                    {preset.names.slice(0, 3).join(", ")}
                    {preset.names.length > 3 ? " и другие" : ""}
                  </p>
                  <div className="birka-product-footer">
                    <strong>{money(preset.price)} ₽</strong>
                    <button type="button" onClick={() => onApplyPreset(preset)}>
                      Настроить надпись <ArrowRight />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
        </div>
      </div>
    </section>
  );
}
