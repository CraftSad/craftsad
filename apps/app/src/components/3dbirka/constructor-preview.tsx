"use client";

import { ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { type Ref, useState } from "react";
import { toast } from "sonner";
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
    <div className="relative top-auto max-h-[none] overflow-hidden flex flex-col justify-between [background:radial-gradient(ellipse_at_50%_40%,#3d4939,transparent_65%),#1b2721] min-w-0 max-[800px]:relative max-[800px]:top-auto max-[800px]:max-h-[none] [@media((min-width:801px)_and_(min-height:780px))]:sticky [@media((min-width:801px)_and_(min-height:780px))]:top-[20px] [@media((min-width:801px)_and_(min-height:780px))]:max-h-[calc(100dvh_-_24px)] [@media((min-width:801px)_and_(min-height:780px))]:overflow-y-auto">
      <div
        className="inline-flex self-center gap-[4px] mt-[18px] mr-[16px] ml-[16px] p-[4px] rounded-full [background:#ffffff0a] border border-solid border-[#ffffff14] [&_button]:border-0 [&_button]:[background:transparent] [&_button]:text-[#b7c4b4] [&_button]:rounded-full [&_button]:py-[7px] [&_button]:px-[15px] [&_button]:min-h-[36px] [&_button]:text-[12px] [&_button]:font-semibold [&_button]:[transition:background_0.2s,color_0.2s] [&_button[aria-selected='true']]:[background:#e9dfc6] [&_button[aria-selected='true']]:text-[#182b21]"
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
                <figure className="[&_img]:w-full [&_img]:h-auto [&_img]:rounded-[16px] [&_img]:object-cover">
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
            <div className="min-h-[440px] flex flex-col items-center justify-between [background:transparent] border-0 rounded-none p-[22px] overflow-hidden flex-[1] relative max-[570px]:min-h-[355px] max-[570px]:p-[17px] max-[800px]:min-h-[400px] max-[800px]:p-[20px]">
              <div className="w-full flex justify-between gap-[20px] text-[11px] text-[#adbaa9] relative z-[2] max-[570px]:text-[10px] [&>span:first-child]:font-normal [&>span:first-child]:text-[#d2dcc8] [&>span:first-child]:flex [&>span:first-child]:items-center [&>span:first-child]:gap-[8px] [&>span:first-child]:text-[12px] [&>span:first-child]:tracking-[.02em] max-[570px]:[&>span:first-child]:text-[11px]">
                <span>
                  <span className="w-[8px] h-[8px] [background:#b6c995] rounded-full shadow-[0_0_12px_#b6c99555]" />{" "}
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
                <div className="flex items-center justify-center gap-[16px] w-full text-[13px] font-bold text-[#e2e7d9] max-[570px]:text-[12px] [&_span]:text-center [&_span]:min-w-0 [&_span]:max-w-[300px] [&_span]:wrap-anywhere [&_button]:flex-[none] [&_button]:w-[40px] [&_button]:h-[40px] [&_button]:grid [&_button]:place-items-center [&_button]:[background:#ffffff07] [&_button]:border [&_button]:border-solid [&_button]:border-[#ffffff20] [&_button]:rounded-full [&_button]:text-[#d2dcc8] [&_svg]:w-[19px] [&_button:hover]:[background:#ffffff18] max-[570px]:[&_button]:w-[38px] max-[570px]:[&_button]:h-[38px]">
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
              className="flex gap-[0] mt-[16px] flex-wrap border border-solid border-[#ffffff10] min-w-0 p-[4px] justify-center self-center [background:#ffffff08] rounded-[50px] mt-[8px] max-[800px]:mt-[8px] max-[800px]:mb-[18px] [&_button]:border-0 [&_button]:[background:transparent] [&_button]:text-[#bfccba] [&_button]:rounded-full [&_button]:py-[10px] [&_button]:px-[20px] [&_button]:min-h-[44px] [&_button]:font-medium [&_button]:text-[14px] [&_button]:flex [&_button]:items-center [&_button]:gap-[7px] [&_button]:relative [&_button]:isolate [&_svg]:w-[16px] max-[570px]:[&_button]:min-h-[43px] max-[570px]:[&_button]:py-[10px] max-[570px]:[&_button]:px-[17px] max-[570px]:[&_button]:text-[12px]"
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
      <p className="text-[#9ba996] text-[10px] mt-[15px] mr-[20px] mb-[24px] ml-[20px] text-center max-w-[350px] self-center max-[800px]:hidden">
        Точный предпросмотр шрифта и переноса строк. Реальный оттенок пластика
        при дневном свете смотрите во вкладке „Живое фото“
      </p>
      <div className="flex justify-center mt-[-8px] mr-[20px] mb-[20px] ml-[20px]">
        <button
          type="button"
          className="inline-flex items-center gap-[6px] py-[6px] px-[13px] rounded-full border border-solid border-[#ffffff1c] [background:#ffffff08] text-[#b7c4b3] text-[11px] font-medium [transition:background_0.2s,color_0.2s,border-color_0.2s] hover:[background:#ffffff16] hover:border-[#ffffff30] hover:text-[#eef3ea] [&_svg]:w-[13px] [&_svg]:h-[13px]"
          onClick={async () => {
            try {
              const { downloadPrintFile } = await import("./print-export");
              await downloadPrintFile(
                shape,
                color,
                currentName,
                "3mf",
                safeIndex,
              );
            } catch {
              toast.error("Не удалось скачать пробник. Попробуйте ещё раз.");
            }
          }}
        >
          <Download aria-hidden="true" /> Скачать пробник 3MF
        </button>
      </div>
    </div>
  );
}
