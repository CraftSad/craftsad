"use client";

import { ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { type Ref, useState } from "react";
import {
  getPaletteForShape,
  type ShapeId,
  shapeToSeries,
  tagPhotos,
  tagSeries,
} from "./data";
import { ScalePreview } from "./scale-preview";
import type { View } from "./shared";
import type { TryOnMode } from "./try-on-types";
import { LabelPreview, Pill } from "./ui";

const LabelScene = dynamic(() => import("./label-scene"), { ssr: false });
const TryOnScene = dynamic(() => import("./try-on-scene"), { ssr: false });

type ConstructorPreviewProps = {
  shape: ShapeId;
  color: number;
  names: string[];
  view: View;
  tryOn: TryOnMode | null;
  previewIndex: number;
  resetViewRef: Ref<() => void>;
  onSelectView: (view: View) => void;
  onSelectTryOn: (mode: TryOnMode) => void;
  onStep: (direction: 1 | -1) => void;
};

export function ConstructorPreview({
  shape,
  color,
  names,
  view,
  tryOn,
  previewIndex,
  resetViewRef,
  onSelectView,
  onSelectTryOn,
  onStep,
}: ConstructorPreviewProps) {
  const [tab, setTab] = useState("model");
  const tabs = [
    ["model", "3D-модель"],
    ["scale", "В масштабе"],
    ["photo", "Живое фото"],
  ];
  const total = Math.max(names.length, 1);
  const safeIndex = previewIndex % total;
  const currentName = names[safeIndex] ?? "Ваш сорт";
  const series = shapeToSeries(shape);
  const seriesMeta =
    tagSeries.find((entry) => entry.id === series) ?? tagSeries[0];
  const palette = getPaletteForShape(shape, color);

  return (
    <div className="birka-builder-left">
      <div
        className="birka-preview-tabs"
        role="tablist"
        aria-label="Режим предпросмотра"
      >
        {tabs.map(([id, title], index) => (
          <button
            type="button"
            role="tab"
            key={id}
            id={`preview-tab-${id}`}
            aria-controls="preview-panel"
            aria-selected={tab === id}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id ?? "model")}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? 2
                    : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
              setTab(tabs[next]?.[0] ?? "model");
              document
                .getElementById(`preview-tab-${tabs[next]?.[0]}`)
                ?.focus();
            }}
          >
            {title}
          </button>
        ))}
      </div>
      <div
        id="preview-panel"
        role="tabpanel"
        aria-labelledby={`preview-tab-${tab}`}
      >
        {tab === "scale" ? (
          <ScalePreview
            shape={shape}
            color={color}
            name={currentName}
            itemIndex={safeIndex}
          />
        ) : tab === "photo" ? (
          <div className="birka-photo-gallery">
            {seriesMeta.coverImage ? (
              <>
                <p>{seriesMeta.description}</p>
                <figure className="birka-series-photo-figure">
                  <Image
                    src={seriesMeta.coverImage}
                    alt={`${seriesMeta.fullTitle} — ${palette.name}`}
                    width={1024}
                    height={682}
                  />
                  <figcaption>
                    {seriesMeta.fullTitle} · {palette.name} ·{" "}
                    {seriesMeta.coverCaption}
                  </figcaption>
                </figure>
              </>
            ) : (
              <>
                <p>
                  Реальные фотографии скоро появятся. Сейчас здесь заглушки, они
                  не передают оттенок пластика.
                </p>
                {tagPhotos[color]?.photos.map((photo) => (
                  <figure key={photo.caption}>
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={640}
                      height={440}
                    />
                    <figcaption>
                      {tagPhotos[color]?.color} · {photo.caption}{" "}
                      {photo.placeholder && "· Фото-заглушка"}
                    </figcaption>
                  </figure>
                ))}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="birka-builder-preview">
              <div className="birka-preview-top">
                <span>
                  <span className="birka-live-dot" />{" "}
                  {tryOn
                    ? tryOn === "seedling"
                      ? "🌱 Рассада"
                      : tryOn === "garden"
                        ? "🌾 Грядка"
                        : "🏡 Теплица"
                    : series === "classic"
                      ? "Живой просмотр"
                      : `${seriesMeta.fullTitle} · 3D`}
                </span>
                {!tryOn && (
                  <span>
                    {Math.min(previewIndex + 1, total)} из {total}
                  </span>
                )}
              </div>

              {tryOn ? (
                <TryOnScene
                  mode={tryOn}
                  shape={shape}
                  color={color}
                  name={currentName}
                  itemIndex={safeIndex}
                  fallback={
                    <LabelPreview
                      shape={shape}
                      color={color}
                      name={currentName}
                      view="front"
                      itemIndex={safeIndex}
                    />
                  }
                />
              ) : (
                <LabelScene
                  shape={shape}
                  color={color}
                  name={currentName}
                  view={view}
                  itemIndex={safeIndex}
                  resetViewRef={resetViewRef}
                  fallback={
                    <LabelPreview
                      shape={shape}
                      color={color}
                      name={currentName}
                      view={view}
                      itemIndex={safeIndex}
                    />
                  }
                />
              )}

              {!tryOn && (
                <div className="birka-preview-pager">
                  <button
                    type="button"
                    aria-label="Предыдущая надпись"
                    onClick={() => onStep(-1)}
                  >
                    <ChevronLeft />
                  </button>
                  <span aria-live="polite">
                    {names[safeIndex] || "Ваша надпись"}
                  </span>
                  <button
                    type="button"
                    aria-label="Следующая надпись"
                    onClick={() => onStep(1)}
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </div>

            <fieldset
              className="birka-view-controls"
              aria-label="Примерить бирку"
            >
              <button
                type="button"
                className={!tryOn && view === "front" ? "active" : ""}
                onClick={() => onSelectView("front")}
              >
                <Pill active={!tryOn && view === "front"} group="view" />
                Спереди
              </button>
              <button
                type="button"
                className={!tryOn && view === "side" ? "active" : ""}
                onClick={() => onSelectView("side")}
              >
                <Pill active={!tryOn && view === "side"} group="view" />
                Сбоку
              </button>
              <button
                type="button"
                className={!tryOn && view === "rotate" ? "active" : ""}
                onClick={() => onSelectView("rotate")}
              >
                <Pill active={!tryOn && view === "rotate"} group="view" />
                <RotateCcw /> 360°
              </button>
              <button
                type="button"
                className={tryOn === "seedling" ? "active" : ""}
                onClick={() => onSelectTryOn("seedling")}
                title="Примерить на рассаду в горшке"
              >
                <Pill active={tryOn === "seedling"} group="view" />🌱 Рассада
              </button>
              <button
                type="button"
                className={tryOn === "garden" ? "active" : ""}
                onClick={() => onSelectTryOn("garden")}
                title="Примерить на грядку"
              >
                <Pill active={tryOn === "garden"} group="view" />🌾 Грядка
              </button>
              <button
                type="button"
                className={tryOn === "greenhouse" ? "active" : ""}
                onClick={() => onSelectTryOn("greenhouse")}
                title="Примерить в теплице"
              >
                <Pill active={tryOn === "greenhouse"} group="view" />🏡 Теплица
              </button>
            </fieldset>
          </>
        )}
      </div>
      <p className="birka-preview-note">
        Точный предпросмотр шрифта и переноса строк. Реальный оттенок пластика
        при дневном свете смотрите во вкладке „Живое фото“
      </p>
      <div className="birka-export-actions">
        <button
          type="button"
          className="birka-inline-export"
          onClick={async () => {
            const { downloadPrintFile } = await import("./print-export");
            await downloadPrintFile(shape, color, currentName, "3mf");
          }}
        >
          <Download aria-hidden="true" /> Скачать пробник 3MF
        </button>
      </div>
    </div>
  );
}
