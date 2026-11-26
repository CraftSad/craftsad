"use client";

import { Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { useState } from "react";
import {
  getPaletteForShape,
  getSeriesPalettes,
  getShapeEntry,
  getShapesForSeries,
  type SeriesId,
  type ShapeId,
  shapeToSeries,
  tagSeries,
} from "./data";
import { money } from "./shared";
import { calculateKit, parseNames } from "./tag-config";
import { Pill, StorefrontDialog } from "./ui";

type ConstructorStepsProps = {
  shape: ShapeId;
  color: number;
  namesText: string;
  names: string[];
  added: boolean;
  mixed?: boolean;
  onSelectSeries: (series: SeriesId) => void;
  onSelectShape: (shape: ShapeId) => void;
  onSelectColor: (color: number) => void;
  onNamesChange: (text: string) => void;
  onAppendName: (name: string) => void;
  onAddToCart: () => void;
};

export function ConstructorSteps({
  shape,
  color,
  namesText,
  names,
  added,
  mixed = false,
  onSelectSeries,
  onSelectShape,
  onSelectColor,
  onNamesChange,
  onAppendName,
  onAddToCart,
}: ConstructorStepsProps) {
  const [help, setHelp] = useState(false);
  const [clipboardError, setClipboardError] = useState("");
  const activeSeries = shapeToSeries(shape);
  const seriesMeta =
    tagSeries.find((entry) => entry.id === activeSeries) ?? tagSeries[0];
  const seriesShapes = getShapesForSeries(activeSeries);
  const palettes = getSeriesPalettes(activeSeries);
  const chosenShape = getShapeEntry(shape);
  const activePalette = getPaletteForShape(shape, color);
  const { price, original, discount } = calculateKit(
    names.length,
    shape,
    mixed,
  );
  const rows = parseNames(namesText);
  const invalid = rows.filter((row) => row.length > 28);
  const progress =
    names.length < 15
      ? `Добавьте ещё ${15 - names.length} бирок, чтобы получить скидку 10%`
      : names.length < 30
        ? `Скидка 10% активна! До скидки 15% осталось ${30 - names.length} бирок`
        : "Максимальная скидка 15% применена";

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      onNamesChange(
        `${namesText.trimEnd()}${namesText.trim() && text ? "\n" : ""}${text}`,
      );
      setClipboardError("");
    } catch {
      setClipboardError(
        "Не удалось прочитать буфер. Вставьте список в поле вручную (Ctrl+V или меню «Вставить»).",
      );
    }
  }

  return (
    <div className="birka-builder-right">
      <div className="birka-builder-step birka-builder-series">
        <div className="birka-builder-heading">
          <span>
            <Sparkles aria-hidden="true" />
          </span>
          <div>
            <h3>Стиль и коллекция</h3>
            <p>Лаконичная классика или фигурные авторские серии</p>
          </div>
        </div>
        <fieldset className="birka-series-picker" aria-label="Серия бирок">
          {tagSeries.map((entry) => {
            const active = activeSeries === entry.id;
            return (
              <button
                type="button"
                key={entry.id}
                className={
                  active ? "birka-series-pill active" : "birka-series-pill"
                }
                aria-pressed={active}
                onClick={() => onSelectSeries(entry.id)}
              >
                <Pill active={active} group="series" />
                <span className="birka-series-pill-head">
                  <strong>{entry.title}</strong>
                  {entry.id !== "classic" && <em>{entry.badge}</em>}
                </span>
                <small>{entry.subtitle}</small>
              </button>
            );
          })}
        </fieldset>
      </div>

      <div className="birka-builder-step">
        <div className="birka-builder-heading">
          <span>1</span>
          <div>
            <h3>Форма и размер</h3>
            <p>
              {activeSeries === "classic"
                ? "Для стаканчиков, грядок или теплицы"
                : seriesMeta.tagline}
            </p>
          </div>
        </div>
        {mixed && (
          <p className="birka-mix-note">
            Микс 10 см + 18 см: формы чередуются по строкам. Выберите форму
            ниже, чтобы сделать весь набор одинаковым.
          </p>
        )}
        <div className="birka-shapes">
          {seriesShapes.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                shape === item.id && !mixed
                  ? "birka-shape active"
                  : "birka-shape"
              }
              aria-pressed={shape === item.id && !mixed}
              onClick={() => onSelectShape(item.id)}
            >
              <Pill active={shape === item.id && !mixed} group="shape" />
              <strong>
                {item.title} · {item.size}
              </strong>
              <small>{item.detail}</small>
              <small>{item.field}</small>
              <b>{item.price} ₽ / шт.</b>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="birka-inline-action"
          onClick={() => setHelp(true)}
        >
          Какую форму выбрать? →
        </button>
      </div>

      <div className="birka-builder-step">
        <div className="birka-builder-heading">
          <span>2</span>
          <div>
            <h3>Цвет</h3>
            <p>
              {activeSeries === "classic"
                ? "Шесть сочетаний, которые хорошо читаются"
                : `Палитра серии «${seriesMeta.title}»`}
            </p>
          </div>
        </div>
        <div className="birka-colors">
          {palettes.map((pair, index) => (
            <button
              type="button"
              key={pair.name}
              aria-label={`${pair.name} — ${pair.label}`}
              className={color === index ? "birka-color active" : "birka-color"}
              aria-pressed={color === index}
              onClick={() => onSelectColor(index)}
            >
              <span
                className="birka-color-swatch"
                style={{
                  background: pair.autoMulti
                    ? activeSeries === "kids"
                      ? "conic-gradient(from 45deg, #eb7c28 0deg 90deg, #d84a3d 90deg 180deg, #f2bf3b 180deg 270deg, #7aa360 270deg 360deg)"
                      : "conic-gradient(from 45deg, #efe5d4 0deg 90deg, #8d987e 90deg 180deg, #9d899c 180deg 270deg, #b96845 270deg 360deg)"
                    : activeSeries === "classic"
                      ? `linear-gradient(135deg, ${pair.base} 0% 64%, ${pair.ink} 64% 100%)`
                      : `linear-gradient(135deg, ${pair.base} 0% 56%, ${pair.accent} 56% 80%, ${pair.ink} 80% 100%)`,
                }}
              />
              <span>
                <strong>
                  {pair.name} · {pair.label}
                </strong>
                <small>{pair.hint}</small>
                {activeSeries === "classic" && index === 0 && (
                  <em>Хит для рассады</em>
                )}
                {pair.autoMulti && <em>Фирменный набор</em>}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="birka-builder-step">
        <div className="birka-builder-heading">
          <span>3</span>
          <div>
            <h3>Введите названия сортов</h3>
            <p id="varieties-help">
              Каждая строка — отдельная бирка. Можно вставить готовый список из
              заметок или Excel.
            </p>
          </div>
        </div>
        {activeSeries !== "classic" && (
          <p className="birka-series-auto-note">
            Силуэт и рельефный рисунок в серии «{seriesMeta.title}» подбираются
            автоматически под название каждой культуры — листайте стрелками на
            превью слева.
          </p>
        )}
        <label htmlFor="varieties" className="birka-field-label">
          Названия сортов, каждое с новой строки
        </label>
        <textarea
          id="varieties"
          rows={5}
          value={namesText}
          aria-invalid={invalid.length > 0}
          aria-describedby="varieties-help varieties-validation"
          onChange={(event) => onNamesChange(event.target.value)}
          placeholder={"Томат Бычье сердце\nОгурец Зозуля\nПерец Сладкий"}
        />
        <div
          id="varieties-validation"
          className="birka-validation"
          aria-live="polite"
        >
          {rows.some((row) => row.length >= 19 && row.length <= 28) && (
            <p>
              ⓘ Длинные названия (19–28 символов) аккуратно перенесём на 2
              строки
            </p>
          )}
          {invalid.map((row) => (
            <p className="birka-line-error" key={row.line}>
              <strong>
                ⚠ Строка №{row.line} слишком длинная ({row.length} симв.) —
                сократите до 28 символов, иначе буквы станут мелкими
              </strong>
              <br />
              <mark>{row.text}</mark>
            </p>
          ))}
        </div>
        <div className="birka-quick-actions">
          <button type="button" onClick={paste}>
            Вставить из буфера
          </button>
          <button
            type="button"
            onClick={() => {
              onNamesChange("");
              setClipboardError("");
            }}
          >
            Очистить
          </button>
        </div>
        {clipboardError && (
          <p role="status" className="birka-mix-note">
            {clipboardError}
          </p>
        )}
        <div className="birka-variety-help">
          <span>Можно добавить популярные сорта:</span>
          <div>
            {seriesMeta.varieties.map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => onAppendName(name)}
              >
                <Plus /> {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="birka-builder-step birka-builder-final">
        <div className="birka-builder-heading">
          <span>4</span>
          <div>
            <h3>Ваш набор готов</h3>
            <p>Проверьте количество и стоимость</p>
          </div>
        </div>
        <div className="birka-discount">
          <p aria-live="polite">{progress}</p>
          <progress
            aria-label="Количество бирок до максимальной скидки"
            value={Math.min(names.length, 30)}
            max={30}
          />
        </div>
        <div className="birka-summary">
          <span>
            {names.length} бирок ·{" "}
            {mixed
              ? "Микс 10 см + 18 см"
              : `${chosenShape.title} · ${chosenShape.size}`}{" "}
            ({activePalette.name})
          </span>
          <div>
            {discount > 0 && <del>{money(original)} ₽</del>}{" "}
            <strong>{money(price)} ₽</strong>
          </div>
        </div>
        <p className="birka-delivery-copy">
          Изготовление за 2 рабочих дня · Доставка в пункт Ozon от 190 ₽
          (бесплатно от 2 000 ₽)
        </p>
        <button
          type="button"
          className="birka-button birka-button-primary"
          disabled={!names.length}
          onClick={onAddToCart}
        >
          {added ? "Добавить ещё один набор" : "Добавить набор в корзину"}
          <ShoppingBag />
        </button>
        <p className="birka-helper">
          Сначала проверим макеты ваших надписей и привяжем их к заказу. Ссылка
          на оплату придёт после подтверждения
        </p>
      </div>

      {help && (
        <StorefrontDialog
          titleId="shape-guide-title"
          onClose={() => setHelp(false)}
        >
          <button
            type="button"
            className="birka-icon-button"
            aria-label="Закрыть сравнение"
            onClick={() => setHelp(false)}
          >
            <X />
          </button>
          <h2 id="shape-guide-title">Какую форму выбрать?</h2>
          {seriesShapes.map((item) => (
            <div className="birka-guide-row" key={item.id}>
              <h3>
                {item.title} · {item.size}
              </h3>
              <p>{item.detail}</p>
              <p>
                {item.field} · {item.price} ₽ / шт.
              </p>
            </div>
          ))}
        </StorefrontDialog>
      )}
    </div>
  );
}
