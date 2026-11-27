"use client";

import { ChevronLeft, Download } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExportDialog, TemplatesDialog } from "./dialogs";
import { Inspector } from "./inspector";
import { designKey, downloadText, isMod, isTyping, plural } from "./lib";
import { checkTag } from "./model/checks";
import { batchNames, fileName } from "./model/export/print";
import { parseProject, serializeProject } from "./model/export/project";
import { fontFaceCss } from "./model/fonts";
import { buildTagAsync } from "./model/geometry";
import { takeHandoff } from "./model/handoff";
import { printer } from "./model/printer";
import { StageBar } from "./stage-bar";
import { CheckList, Notice } from "./status";
import { activeName, useEditor } from "./store";
import { Toolbar } from "./toolbar";

/** The 3D scene needs WebGL, so it is only ever loaded in the browser. */
const Viewport = dynamic(
  () => import("./viewport").then((mod) => mod.Viewport),
  {
    ssr: false,
    loading: () => <div className="brk-canvas-note">Загрузка 3D-сцены…</div>,
  },
);

const STORAGE = "3dbirka-editor-project";
/** Below this width the parameter panel starts closed. */
const WIDE = 1000;
/** Density of PLA, grammes per cubic millimetre. */
const PLA = 0.00124;
/** Pause after the last edit before the model is rebuilt. */
const REBUILD_DELAY = 80;

function readSaved(): string | null {
  try {
    return window.localStorage.getItem(STORAGE);
  } catch {
    return null;
  }
}

function writeSaved(text: string) {
  try {
    window.localStorage.setItem(STORAGE, text);
  } catch {
    // Private mode or a full quota: the editor still works, just unsaved.
  }
}

export function TagEditor() {
  const project = useEditor((state) => state.project);
  const active = useEditor((state) => state.active);
  const panel = useEditor((state) => state.panel);
  const dialog = useEditor((state) => state.dialog);
  const shown = useEditor((state) => state.built);
  const issues = useEditor((state) => state.issues);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  /** Number of the newest model request; older results are dropped. */
  const request = useRef(0);

  // Open, in order: the setup carried over from the storefront, the project
  // that was last edited, or the first template.
  useEffect(() => {
    const handed = takeHandoff();
    if (handed) {
      useEditor.getState().replace(handed);
    } else {
      const saved = readSaved();
      if (saved) {
        try {
          useEditor.getState().replace(parseProject(saved));
        } catch {
          setNotice("Сохранённый проект не читается — открыта заготовка");
        }
      }
    }
    if (window.innerWidth < WIDE) useEditor.getState().setPanel(false);
    setReady(true);
  }, []);

  const name = activeName(project, active);
  const tag = project.tag;
  // Retyping the title must not rebuild the model; the design and the
  // printed line must. The key stands for both.
  const design = designKey(project);
  const key = `${design}\n${name}`;
  const latest = useRef(tag);
  useEffect(() => {
    latest.current = tag;
  }, [tag]);

  // Rebuild the shown tag when its design or text changes. Only the newest
  // request may apply, so quick edits never end on a stale model.
  useEffect(() => {
    if (!ready) return;
    const current = ++request.current;
    const timer = setTimeout(() => {
      // The key carries the design and the printed line.
      const [design, name] = key.split("\n") as [string, string];
      const tag = latest.current;
      useEditor.setState({ building: true });
      buildTagAsync(tag, name).then(
        (built) => {
          if (current !== request.current) return;
          const store = useEditor.getState();
          store.rememberBuild(design, name, built);
          store.setBuilt(built, checkTag(tag, built));
        },
        (error: unknown) => {
          if (current !== request.current) return;
          useEditor
            .getState()
            .setFailed(error instanceof Error ? error.message : String(error));
        },
      );
    }, REBUILD_DELAY);
    return () => {
      clearTimeout(timer);
      request.current++;
    };
  }, [key, ready]);

  // Autosave: the work survives a reload or a closed tab.
  const saved = serializeProject(project);
  useEffect(() => {
    if (ready) writeSaved(saved);
  }, [ready, saved]);

  // Undo, redo and save from the keyboard, wherever the focus is.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        useEditor.getState().dialog ||
        isTyping(event.target) ||
        !isMod(event)
      )
        return;
      const pressed = event.key.toLowerCase();
      const redo = pressed === "y" || (pressed === "z" && event.shiftKey);
      if (redo || pressed === "z") {
        event.preventDefault();
        if (redo) useEditor.getState().redo();
        else useEditor.getState().undo();
      } else if (pressed === "s") {
        event.preventDefault();
        downloadText(saved, `${fileName(project.title)}.birka.json`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project.title, saved]);

  const open = (text: string) => {
    try {
      const next = parseProject(text);
      useEditor.getState().replace(next);
      setNotice(`Открыт проект «${next.title}»`);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : String(cause));
    }
  };
  const setDialog = useEditor((state) => state.setDialog);
  const count = batchNames(project).length;
  const mm = (value: number) =>
    value.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  const grams = shown
    ? (shown.volume * PLA).toLocaleString("ru-RU", { maximumFractionDigits: 1 })
    : "";

  return (
    <div className="brk-app">
      <header className="brk-topbar">
        <Link href="/" className="brk-home">
          <ChevronLeft /> На сайт
        </Link>
        <input
          className="brk-title"
          value={project.title}
          maxLength={60}
          aria-label="Название проекта"
          placeholder="Название проекта"
          spellCheck={false}
          onChange={(event) =>
            useEditor.getState().update((draft) => {
              draft.title = event.target.value;
            }, "title")
          }
        />
        <span className="brk-count">
          {count} {plural(count, "бирка", "бирки", "бирок")} · {printer.name}
        </span>
        <Toolbar onOpen={open} />
        <button
          type="button"
          className="brk-button primary"
          onClick={() => setDialog("export")}
        >
          <Download /> Печать
        </button>
      </header>

      {notice && <Notice text={notice} onClose={() => setNotice("")} />}

      <main className={panel ? "brk-main" : "brk-main no-panel"}>
        <section className="brk-stage" aria-label="3D-вид">
          <StageBar />
          <div className="brk-canvas">
            <Viewport />
          </div>
          <div className="brk-facts">
            <span>
              {shown
                ? `${mm(shown.size.x)} × ${mm(shown.size.y)} × ${mm(shown.size.z)} мм`
                : "Размер —"}
            </span>
            <span>{grams ? `≈ ${grams} г пластика` : "Вес —"}</span>
          </div>
          <CheckList issues={issues} />
        </section>
        {panel && <Inspector />}
      </main>

      {dialog === "templates" && <TemplatesDialog />}
      {dialog === "export" && <ExportDialog />}
      <style>{fontFaceCss()}</style>
    </div>
  );
}
