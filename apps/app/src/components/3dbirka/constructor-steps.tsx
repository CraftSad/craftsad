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
    <div className="[background:#15221c] border-0 rounded-none p-[26px] border-left-[1px] border-left-[#ffffff0e] min-w-0 max-[1100px]:p-[24px] max-[1150px]:p-[22px] max-[570px]:py-[20px] max-[570px]:px-[16px] max-[800px]:p-[26px] max-[800px]:[border-left:0] [&_textarea]:h-[102px] [&_textarea]:min-h-[102px] [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#ffffff1c] [&_textarea]:rounded-[11px] [&_textarea]:[background:#ffffff05] [&_textarea]:text-[#e5eadd] [&_textarea]:text-[16px] [&_textarea]:leading-[1.75] [&_textarea]:py-[12px] [&_textarea]:px-[15px] [&_textarea]:resize-y [&_textarea]:max-h-[180px] [&_textarea:focus]:border-[#aebd9c] [&_textarea:focus]:[outline-color:#aebd9c] max-[800px]:[&_textarea]:text-[16px]">
      <div className="border-0 p-0 mb-[21px] mb-[18px] pb-[18px] border-bottom-[1px] border-bottom-[#ffffff14]">
        <div className="flex items-start gap-[10px] mb-[12px] [&>span]:flex-[none] [&>span]:w-[34px] [&>span]:h-[34px] [&>span]:rounded-full [&>span]:[background:#23483e] [&>span]:text-[white] [&>span]:hidden [&>span]:place-items-center [&>span]:text-[16px] [&>span]:font-extrabold [&_h3]:font-[500] [&_h3]:text-[15px] [&_h3]:font-craft [&_h3]:mt-[2px] [&_h3]:mb-[5px] [&_h3]:text-[#e4e8dd] [&_h3]:text-[17px] [&_p]:text-hedge [&_p]:text-[15px] [&_p]:m-0 [&_p]:hidden max-[570px]:[&_h3]:text-[16px] max-[800px]:[&_h3]:text-[16px]">
          <span>
            <Sparkles aria-hidden="true" />
          </span>
          <div>
            <h3>Стиль и коллекция</h3>
            <p>Лаконичная классика или фигурные авторские серии</p>
          </div>
        </div>
        <fieldset
          className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[8px] mt-[12px] p-0 border-0 min-w-0 max-[640px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[640px]:gap-[6px]"
          aria-label="Серия бирок"
        >
          {tagSeries.map((entry) => {
            const active = activeSeries === entry.id;
            return (
              <button
                type="button"
                key={entry.id}
                className={
                  active
                    ? "relative isolate flex flex-col items-start gap-[3px] text-left py-[11px] px-[13px] rounded-[14px] border border-solid border-[#ffffff16] [background:#ffffff07] text-[#e4ebe0] [transition:border-color_0.2s,background_0.2s,color_0.2s] min-w-0 hover:border-[#ffffff30] hover:[background:#ffffff10] max-[640px]:py-[9px] max-[640px]:px-[10px] [&_strong]:text-[14px] [&_strong]:font-bold [&_strong]:leading-[1.2] [&_em]:not-italic [&_em]:text-[10px] [&_em]:font-bold [&_em]:tracking-[0.03em] [&_em]:py-[2px] [&_em]:px-[7px] [&_em]:rounded-full [&_em]:[background:#ffffff18] [&_em]:text-[#e4cf9f] [&_small]:relative [&_small]:z-[1] [&_small]:text-[11px] [&_small]:leading-[1.3] [&_small]:text-[#9fb0a3] max-[640px]:[&_strong]:text-[13px] max-[640px]:[&_small]:text-[10px] active"
                    : "relative isolate flex flex-col items-start gap-[3px] text-left py-[11px] px-[13px] rounded-[14px] border border-solid border-[#ffffff16] [background:#ffffff07] text-[#e4ebe0] [transition:border-color_0.2s,background_0.2s,color_0.2s] min-w-0 hover:border-[#ffffff30] hover:[background:#ffffff10] max-[640px]:py-[9px] max-[640px]:px-[10px] [&_strong]:text-[14px] [&_strong]:font-bold [&_strong]:leading-[1.2] [&_em]:not-italic [&_em]:text-[10px] [&_em]:font-bold [&_em]:tracking-[0.03em] [&_em]:py-[2px] [&_em]:px-[7px] [&_em]:rounded-full [&_em]:[background:#ffffff18] [&_em]:text-[#e4cf9f] [&_small]:relative [&_small]:z-[1] [&_small]:text-[11px] [&_small]:leading-[1.3] [&_small]:text-[#9fb0a3] max-[640px]:[&_strong]:text-[13px] max-[640px]:[&_small]:text-[10px]"
                }
                aria-pressed={active}
                onClick={() => onSelectSeries(entry.id)}
              >
                <Pill active={active} group="series" />
                <span className="relative z-[1] flex flex-wrap items-center gap-[6px] w-full">
                  <strong>{entry.title}</strong>
                  {entry.id !== "classic" && <em>{entry.badge}</em>}
                </span>
                <small>{entry.subtitle}</small>
              </button>
            );
          })}
        </fieldset>
      </div>

      <div className="border-0 p-0 mb-[21px]">
        <div className="flex items-start gap-[10px] mb-[12px] [&>span]:flex-[none] [&>span]:w-[34px] [&>span]:h-[34px] [&>span]:rounded-full [&>span]:[background:#23483e] [&>span]:text-[white] [&>span]:hidden [&>span]:place-items-center [&>span]:text-[16px] [&>span]:font-extrabold [&_h3]:font-[500] [&_h3]:text-[15px] [&_h3]:font-craft [&_h3]:mt-[2px] [&_h3]:mb-[5px] [&_h3]:text-[#e4e8dd] [&_h3]:text-[17px] [&_p]:text-hedge [&_p]:text-[15px] [&_p]:m-0 [&_p]:hidden max-[570px]:[&_h3]:text-[16px] max-[800px]:[&_h3]:text-[16px]">
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
          <p>
            Микс 10 см + 18 см: формы чередуются по строкам. Выберите форму
            ниже, чтобы сделать весь набор одинаковым.
          </p>
        )}
        <div className="grid gap-[6px] [background:#ffffff06] border border-solid border-[#ffffff0b] rounded-[13px] p-[4px] grid-cols-[repeat(3,minmax(0,1fr))] max-[570px]:gap-[3px] max-[640px]:grid-cols-[1fr]">
          {seriesShapes.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                shape === item.id && !mixed
                  ? "w-auto min-h-[58px] border-0 rounded-[9px] [background:transparent] py-[11px] px-[8px] flex items-center text-center gap-[4px] text-[#bdc9b9] flex-[1] justify-between relative isolate flex-col min-w-0 [&>span:nth-child(2)]:flex-[initial] [&_strong]:block [&_strong]:text-[14px] [&_strong]:leading-[1.3] [&_strong]:font-semibold [&_small]:block [&_small]:text-[inherit] [&_small]:text-[11px] [&_small]:mt-[4px] [&_small]:opacity-[.8] [&_small]:leading-[1.3] [&>svg]:text-forest [&>svg]:w-[20px] [&>svg]:h-[20px] [&>svg]:hidden max-[570px]:[&_strong]:text-[13px] max-[570px]:[&_small]:text-[12px] [&>span]:static max-[800px]:[&_strong]:text-[14px] max-[800px]:[&_small]:text-[12px] [&_small:nth-of-type(2)]:hidden [&_b]:text-[12px] [&_b]:font-bold [&_b]:mt-[2px] active"
                  : "w-auto min-h-[58px] border-0 rounded-[9px] [background:transparent] py-[11px] px-[8px] flex items-center text-center gap-[4px] text-[#bdc9b9] flex-[1] justify-between relative isolate flex-col min-w-0 [&>span:nth-child(2)]:flex-[initial] [&_strong]:block [&_strong]:text-[14px] [&_strong]:leading-[1.3] [&_strong]:font-semibold [&_small]:block [&_small]:text-[inherit] [&_small]:text-[11px] [&_small]:mt-[4px] [&_small]:opacity-[.8] [&_small]:leading-[1.3] [&>svg]:text-forest [&>svg]:w-[20px] [&>svg]:h-[20px] [&>svg]:hidden max-[570px]:[&_strong]:text-[13px] max-[570px]:[&_small]:text-[12px] [&>span]:static max-[800px]:[&_strong]:text-[14px] max-[800px]:[&_small]:text-[12px] [&_small:nth-of-type(2)]:hidden [&_b]:text-[12px] [&_b]:font-bold [&_b]:mt-[2px]"
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

      <div className="border-0 p-0 mb-[21px]">
        <div className="flex items-start gap-[10px] mb-[12px] [&>span]:flex-[none] [&>span]:w-[34px] [&>span]:h-[34px] [&>span]:rounded-full [&>span]:[background:#23483e] [&>span]:text-[white] [&>span]:hidden [&>span]:place-items-center [&>span]:text-[16px] [&>span]:font-extrabold [&_h3]:font-[500] [&_h3]:text-[15px] [&_h3]:font-craft [&_h3]:mt-[2px] [&_h3]:mb-[5px] [&_h3]:text-[#e4e8dd] [&_h3]:text-[17px] [&_p]:text-hedge [&_p]:text-[15px] [&_p]:m-0 [&_p]:hidden max-[570px]:[&_h3]:text-[16px] max-[800px]:[&_h3]:text-[16px]">
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
        <div className="flex grid-cols-[repeat(2,minmax(0,1fr))] gap-[13px] max-[1150px]:gap-[9px] max-[570px]:grid-cols-[1fr] max-[570px]:gap-[3px] max-[570px]:justify-between max-[570px]:flex-wrap max-[800px]:gap-[16px]">
          {palettes.map((pair, index) => (
            <button
              type="button"
              key={pair.name}
              aria-label={`${pair.name} — ${pair.label}`}
              className={
                color === index
                  ? "border border-solid border-[transparent] [background:transparent] rounded-full min-h-[44px] p-[4px] block items-center text-left gap-[10px] text-ink h-[43px] w-[43px] relative [transition:transform_.2s] min-w-[44px] hover:[transform:translateY(-3px)] max-[570px]:gap-[6px] max-[570px]:p-[4px] max-[570px]:min-h-[65px] max-[570px]:w-[41px] max-[570px]:h-[41px] [&_strong]:block [&_strong]:text-[17px] [&_strong]:leading-[1.3] [&_small]:block [&_small]:text-hedge [&_small]:text-[15px] [&_small]:mt-[3px] [&>svg]:text-forest [&>svg]:w-[20px] [&>svg]:h-[20px] [&>svg]:hidden [&>span:nth-child(2)]:flex-[1] [&>span:nth-child(2)]:min-w-0 [&>span:nth-child(2)]:hidden max-[570px]:[&_strong]:text-[17px] max-[570px]:[&_small]:text-[15px] max-[570px]:[&>svg]:w-[16px] active"
                  : "border border-solid border-[transparent] [background:transparent] rounded-full min-h-[44px] p-[4px] block items-center text-left gap-[10px] text-ink h-[43px] w-[43px] relative [transition:transform_.2s] min-w-[44px] hover:[transform:translateY(-3px)] max-[570px]:gap-[6px] max-[570px]:p-[4px] max-[570px]:min-h-[65px] max-[570px]:w-[41px] max-[570px]:h-[41px] [&_strong]:block [&_strong]:text-[17px] [&_strong]:leading-[1.3] [&_small]:block [&_small]:text-hedge [&_small]:text-[15px] [&_small]:mt-[3px] [&>svg]:text-forest [&>svg]:w-[20px] [&>svg]:h-[20px] [&>svg]:hidden [&>span:nth-child(2)]:flex-[1] [&>span:nth-child(2)]:min-w-0 [&>span:nth-child(2)]:hidden max-[570px]:[&_strong]:text-[17px] max-[570px]:[&_small]:text-[15px] max-[570px]:[&>svg]:w-[16px]"
              }
              aria-pressed={color === index}
              onClick={() => onSelectColor(index)}
            >
              <span
                className="w-[33px] h-[33px] rounded-full flex-[none] block place-items-center [font-family:Georgia,serif] text-[18px] font-extrabold shadow-[inset_0_0_0_1px_#00000013] border border-solid border-[#ffffff25] max-[570px]:w-[33px] max-[570px]:h-[33px] max-[570px]:text-[15px]"
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

      <div className="border-0 p-0 mb-[21px]">
        <div className="flex items-start gap-[10px] mb-[12px] [&>span]:flex-[none] [&>span]:w-[34px] [&>span]:h-[34px] [&>span]:rounded-full [&>span]:[background:#23483e] [&>span]:text-[white] [&>span]:hidden [&>span]:place-items-center [&>span]:text-[16px] [&>span]:font-extrabold [&_h3]:font-[500] [&_h3]:text-[15px] [&_h3]:font-craft [&_h3]:mt-[2px] [&_h3]:mb-[5px] [&_h3]:text-[#e4e8dd] [&_h3]:text-[17px] [&_p]:text-hedge [&_p]:text-[15px] [&_p]:m-0 [&_p]:hidden max-[570px]:[&_h3]:text-[16px] max-[800px]:[&_h3]:text-[16px]">
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
          <p className="mb-[12px] py-[10px] px-[13px] rounded-[12px] [background:#e4cf9f14] border border-solid border-[#e4cf9f36] text-[#e9dec4] text-[12px] leading-[1.5]">
            Силуэт и рельефный рисунок в серии «{seriesMeta.title}» подбираются
            автоматически под название каждой культуры — листайте стрелками на
            превью слева.
          </p>
        )}
        <label
          htmlFor="varieties"
          className="block font-extrabold text-[14px] mb-[8px] text-[#abb9a5] max-[800px]:text-[13px]"
        >
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
        {clipboardError && <p role="status">{clipboardError}</p>}
        <div className="mt-[10px] [&>span]:text-[15px] [&>span]:text-hedge [&>span]:hidden [&>div]:flex [&>div]:gap-[6px] [&>div]:flex-nowrap [&>div]:mt-[9px] [&>div]:overflow-auto [&>div]:pt-[2px] [&>div]:pb-[6px] [&>div]:[scrollbar-width:none] [&_button]:border [&_button]:border-solid [&_button]:border-[#ffffff15] [&_button]:[background:#ffffff04] [&_button]:text-[#bfccb7] [&_button]:rounded-[30px] [&_button]:py-[6px] [&_button]:px-[9px] [&_button]:text-[12px] [&_button]:font-bold [&_button]:flex [&_button]:items-center [&_button]:gap-[4px] [&_button]:whitespace-nowrap [&_button]:min-h-[38px] [&_button:hover]:[background:#e5f0e2] [&_svg]:w-[15px] [&_svg]:h-[15px] max-[800px]:[&_button]:text-[12px] max-[800px]:[&_button]:min-h-[40px] [&>div::-webkit-scrollbar]:hidden">
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

      <div className="border-0 p-0 mb-[21px] [background:transparent] mx-[-32px] mb-[-32px] pt-[18px] rounded-[0_0_15px_15px] m-0 border-top-[1px] border-top-[#ffffff15] max-[1100px]:mx-[-24px] max-[1100px]:mb-[-24px] max-[1100px]:p-[24px] max-[570px]:mx-[-18px] max-[570px]:mb-[-18px] max-[570px]:pt-[17px] max-[570px]:m-0">
        <div className="flex items-start gap-[10px] mb-[12px] [&>span]:flex-[none] [&>span]:w-[34px] [&>span]:h-[34px] [&>span]:rounded-full [&>span]:[background:#23483e] [&>span]:text-[white] [&>span]:hidden [&>span]:place-items-center [&>span]:text-[16px] [&>span]:font-extrabold [&_h3]:font-[500] [&_h3]:text-[15px] [&_h3]:font-craft [&_h3]:mt-[2px] [&_h3]:mb-[5px] [&_h3]:text-[#e4e8dd] [&_h3]:text-[17px] [&_p]:text-hedge [&_p]:text-[15px] [&_p]:m-0 [&_p]:hidden max-[570px]:[&_h3]:text-[16px] max-[800px]:[&_h3]:text-[16px]">
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
        <div className="flex items-center justify-between gap-[20px] mb-[14px] [&>span]:text-[16px] [&>span]:text-[#c0ccba] [&_strong]:font-[500] [&_strong]:text-[32px] [&_strong]:font-craft [&_strong]:text-[#eef1e6] [&_strong]:whitespace-nowrap [&_strong]:tracking-[-1px] max-[570px]:[&_strong]:text-[30px] max-[800px]:[&>span]:text-[16px]">
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
          className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
          disabled={!names.length}
          onClick={onAddToCart}
        >
          {added ? "Добавить ещё один набор" : "Добавить набор в корзину"}
          <ShoppingBag />
        </button>
        <p className="text-[15px] text-hedge mt-[10px]">
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
            className="w-[44px] h-[44px] grid place-items-center border border-solid border-linen [background:white] rounded-full text-ink max-[800px]:[background:#ffffff75] max-[800px]:border-0 [&_svg]:w-[21px] [&_svg]:h-[21px]"
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
