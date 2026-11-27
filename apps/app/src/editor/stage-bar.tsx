"use client";

import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { batchNames } from "./model/export/print";
import { printer } from "./model/printer";
import { activeName, useEditor } from "./store";

/** View switch, the tag being shown and the print status. */
export function StageBar() {
  const view = useEditor((state) => state.view);
  const active = useEditor((state) => state.active);
  const project = useEditor((state) => state.project);
  const building = useEditor((state) => state.building);
  const issues = useEditor((state) => state.issues);
  const names = batchNames(project);
  const onBed = view === "bed";
  const status = issues.some((issue) => issue.level === "error")
    ? { text: "Есть ошибки", tone: "error" }
    : issues.some((issue) => issue.level === "warning")
      ? { text: "Есть замечания", tone: "warning" }
      : { text: "Готово к печати", tone: "ok" };
  const step = (direction: number) => {
    const total = Math.max(names.length, 1);
    useEditor
      .getState()
      .setActive((((active + direction) % total) + total) % total);
  };
  return (
    <div className="brk-stage-bar">
      <div className="brk-seg" role="group" aria-label="Что показывать">
        <button
          type="button"
          aria-pressed={!onBed}
          onClick={() => useEditor.getState().setView("model")}
        >
          Бирка
        </button>
        <button
          type="button"
          aria-pressed={onBed}
          onClick={() => useEditor.getState().setView("bed")}
        >
          Стол {printer.bed.x}×{printer.bed.y}
        </button>
      </div>
      <div className="brk-pager">
        <button
          type="button"
          aria-label="Предыдущая бирка"
          disabled={names.length < 2}
          onClick={() => step(-1)}
        >
          <ChevronLeft />
        </button>
        <span aria-live="polite">
          {onBed
            ? `${names.length || 1} ${names.length === 1 ? "бирка" : "бирок"} на столе`
            : activeName(project, active)}
        </span>
        <button
          type="button"
          aria-label="Следующая бирка"
          disabled={names.length < 2}
          onClick={() => step(1)}
        >
          <ChevronRight />
        </button>
      </div>
      <span className={`brk-status ${status.tone}`} role="status">
        {building && <LoaderCircle className="brk-spin" aria-hidden="true" />}
        {status.text}
      </span>
    </div>
  );
}
