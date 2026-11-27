"use client";

import {
  FolderOpen,
  Save,
  SlidersHorizontal,
  Undo2,
  Wand2,
} from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";
import { downloadText } from "./lib";
import { fileName } from "./model/export/print";
import { parseProject, serializeProject } from "./model/export/project";
import { useEditor } from "./store";

type Props = {
  /** Called with a project file's text when the user opens one. */
  onOpen: (text: string) => void;
};

/** Editing commands that live above the viewport. */
export function Toolbar({ onOpen }: Props) {
  const canUndo = useEditor((state) => state.past.length > 0);
  const canRedo = useEditor((state) => state.future.length > 0);
  const panel = useEditor((state) => state.panel);
  const fileInput = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [saved, setSaved] = useState(false);

  const save = () => {
    downloadText(
      serializeProject(useEditor.getState().project),
      `${fileName(useEditor.getState().project.title)}.birka.json`,
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const open = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // the same file can be opened again
    if (file) void file.text().then(onOpen);
  };
  return (
    <div className="flex items-center gap-[4px] ml-auto max-[700px]:[order:3] max-[700px]:w-full max-[700px]:ml-0">
      <button
        type="button"
        className="grid place-items-center w-[38px] h-[38px] border border-solid border-linen rounded-[10px] [background:var(--paper)] hover:disabled:border-forest hover:disabled:[background:#f5f1e8] [&_svg]:w-[18px] [&_svg]:h-[18px]"
        aria-label="Отменить (Ctrl+Z)"
        title="Отменить (Ctrl+Z)"
        disabled={!canUndo}
        onClick={useEditor.getState().undo}
      >
        <Undo2 />
      </button>
      <button
        type="button"
        className="grid place-items-center w-[38px] h-[38px] border border-solid border-linen rounded-[10px] [background:var(--paper)] hover:disabled:border-forest hover:disabled:[background:#f5f1e8] [&_svg]:w-[18px] [&_svg]:h-[18px]"
        aria-label="Вернуть (Ctrl+Shift+Z)"
        title="Вернуть (Ctrl+Shift+Z)"
        disabled={!canRedo}
        onClick={useEditor.getState().redo}
      >
        <Undo2 style={{ transform: "scaleX(-1)" }} />
      </button>
      <span className="w-[1px] h-[22px] my-[0] mx-[6px] [background:#e6e2da]" />
      <button
        type="button"
        className="grid place-items-center w-[38px] h-[38px] border border-solid border-linen rounded-[10px] [background:var(--paper)] hover:disabled:border-forest hover:disabled:[background:#f5f1e8] [&_svg]:w-[18px] [&_svg]:h-[18px]"
        aria-label="Заготовки"
        title="Заготовки"
        onClick={() => useEditor.getState().setDialog("templates")}
      >
        <Wand2 />
      </button>
      <button
        type="button"
        className="grid place-items-center w-[38px] h-[38px] border border-solid border-linen rounded-[10px] [background:var(--paper)] hover:disabled:border-forest hover:disabled:[background:#f5f1e8] [&_svg]:w-[18px] [&_svg]:h-[18px]"
        aria-label="Открыть проект"
        title="Открыть проект"
        onClick={() => fileInput.current?.click()}
      >
        <FolderOpen />
      </button>
      <button
        type="button"
        className="grid place-items-center w-[38px] h-[38px] border border-solid border-linen rounded-[10px] [background:var(--paper)] hover:disabled:border-forest hover:disabled:[background:#f5f1e8] [&_svg]:w-[18px] [&_svg]:h-[18px]"
        aria-label="Сохранить проект (Ctrl+S)"
        title="Сохранить проект (Ctrl+S)"
        onClick={save}
      >
        <Save />
      </button>
      <input
        ref={fileInput}
        id={inputId}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={open}
      />
      <span
        className="min-w-0 text-[var(--ok)] text-[13px] whitespace-nowrap max-[1000px]:hidden"
        role="status"
      >
        {saved ? "Проект сохранён" : ""}
      </span>
      <button
        type="button"
        className="grid place-items-center w-[38px] h-[38px] border border-solid border-linen rounded-[10px] [background:var(--paper)] hover:disabled:border-forest hover:disabled:[background:#f5f1e8] [&_svg]:w-[18px] [&_svg]:h-[18px]"
        aria-label={panel ? "Скрыть параметры" : "Показать параметры"}
        aria-pressed={panel}
        title="Показать или скрыть параметры"
        onClick={() => useEditor.getState().setPanel(!panel)}
      >
        <SlidersHorizontal />
      </button>
    </div>
  );
}
