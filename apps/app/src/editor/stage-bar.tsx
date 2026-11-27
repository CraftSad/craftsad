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
    <div className="flex flex-wrap items-center gap-[10px_16px] py-[10px] px-[16px] border-bottom-[1px] border-bottom-[#e6e2da] [background:var(--paper)]">
      <div
        className="inline-flex p-[3px] border border-solid border-linen rounded-[10px] [background:#f5f1e8] [&>button]:min-h-[30px] [&>button]:py-[4px] [&>button]:px-[12px] [&>button]:border-0 [&>button]:rounded-[8px] [&>button]:[background:none] [&>button]:text-hedge [&>button]:whitespace-nowrap [&>button]:flex-[1] [&>button[aria-pressed=true]]:[background:#23483e] [&>button[aria-pressed=true]]:text-[#fff] [&>button[aria-checked=true]]:[background:#23483e] [&>button[aria-checked=true]]:text-[#fff] [&>button[aria-selected=true]]:[background:#23483e] [&>button[aria-selected=true]]:text-[#fff] [&>button:hover:not(:disabled]:text-ink"
        role="group"
        aria-label="Что показывать"
      >
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
      <div className="inline-flex items-center gap-[6px] mr-auto [&_svg]:w-[18px] [&_svg]:h-[18px] [&>span]:max-w-[30vw] [&>span]:overflow-hidden [&>span]:text-ink [&>span]:font-semibold [&>span]:text-ellipsis [&>span]:whitespace-nowrap [&_button]:grid [&_button]:place-items-center [&_button]:w-[32px] [&_button]:h-[32px] [&_button]:border [&_button]:border-solid [&_button]:border-linen [&_button]:rounded-[8px] [&_button]:[background:var(--paper)]">
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
      <span
        className={`inline-flex items-center gap-[6px] font-semibold whitespace-nowrap text-brass ${status.tone}`}
        role="status"
      >
        {building && (
          <LoaderCircle
            className="[animation:brk-spin_0.9s_linear_infinite]"
            aria-hidden="true"
          />
        )}
        {status.text}
      </span>
    </div>
  );
}
