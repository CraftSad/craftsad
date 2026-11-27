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
    <div className="brk-toolbar">
      <button
        type="button"
        className="brk-tool"
        aria-label="Отменить (Ctrl+Z)"
        title="Отменить (Ctrl+Z)"
        disabled={!canUndo}
        onClick={useEditor.getState().undo}
      >
        <Undo2 />
      </button>
      <button
        type="button"
        className="brk-tool"
        aria-label="Вернуть (Ctrl+Shift+Z)"
        title="Вернуть (Ctrl+Shift+Z)"
        disabled={!canRedo}
        onClick={useEditor.getState().redo}
      >
        <Undo2 style={{ transform: "scaleX(-1)" }} />
      </button>
      <span className="brk-tool-sep" />
      <button
        type="button"
        className="brk-tool"
        aria-label="Заготовки"
        title="Заготовки"
        onClick={() => useEditor.getState().setDialog("templates")}
      >
        <Wand2 />
      </button>
      <button
        type="button"
        className="brk-tool"
        aria-label="Открыть проект"
        title="Открыть проект"
        onClick={() => fileInput.current?.click()}
      >
        <FolderOpen />
      </button>
      <button
        type="button"
        className="brk-tool"
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
      <span className="brk-saved" role="status">
        {saved ? "Проект сохранён" : ""}
      </span>
      <button
        type="button"
        className="brk-tool"
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
