"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import type { Ref } from "react";
import type { ShapeId } from "./data";
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
  const total = Math.max(names.length, 1);
  const currentName = names[previewIndex % total] ?? "Ваш сорт";

  return (
    <div className="birka-builder-left">
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
              : "Живой просмотр"}
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
            fallback={
              <LabelPreview
                shape={shape}
                color={color}
                name={currentName}
                view="front"
              />
            }
          />
        ) : (
          <LabelScene
            shape={shape}
            color={color}
            name={currentName}
            view={view}
            resetViewRef={resetViewRef}
            fallback={
              <LabelPreview
                shape={shape}
                color={color}
                name={currentName}
                view={view}
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
              {names[previewIndex % total] || "Ваша надпись"}
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

      <fieldset className="birka-view-controls" aria-label="Примерить бирку">
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
      <p className="birka-preview-note">
        {tryOn
          ? "Вращайте сцену мышью. Бирка оживает в вашем саду."
          : "Изображение помогает представить изделие. Готовая бирка может немного отличаться."}
      </p>
    </div>
  );
}
