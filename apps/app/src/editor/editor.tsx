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
    loading: () => (
      <div className="grid place-items-center min-h-[60vh] text-hedge">
        Загрузка 3D-сцены…
      </div>
    ),
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
  const initialized = useRef(false);

  // Open, in order: the setup carried over from the storefront, the project
  // that was last edited, or the first template.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
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
  // printed line must.
  const design = designKey(project);
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
  }, [design, name, ready]);

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
    <div className="flex flex-col h-[100dvh] overflow-hidden text-ink [background:#f5f1e8] [font-family:var(--sans)] text-[14px] leading-[1.45] [&_:is(button]:[outline:3px_solid_#a57d46] [&_:is(button]:outline-offset-[2px] [&_button]:[font:inherit] [&_button]:text-[inherit] [&_button]:cursor-pointer [&_button]:touch-manipulation [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-[0.45] [&_:is(input[type=text]]:w-full [&_:is(input[type=text]]:py-[8px] [&_:is(input[type=text]]:px-[10px] [&_:is(input[type=text]]:border [&_:is(input[type=text]]:border-solid [&_:is(input[type=text]]:border-linen [&_:is(input[type=text]]:rounded-[8px] [&_:is(input[type=text]]:[background:#f5f1e8] [&_:is(input[type=text]]:text-ink [&_:is(input[type=text]]:[font:inherit]">
      <header className="flex items-center gap-[16px] min-h-[58px] py-[8px] px-[16px] border-bottom-[1px] border-bottom-[#e6e2da] [background:var(--paper)] max-[700px]:flex-wrap max-[700px]:gap-[8px]">
        <Link
          href="/"
          className="inline-flex items-center gap-[4px] pt-[8px] pr-[12px] pb-[8px] pl-[8px] rounded-full text-forest no-underline whitespace-nowrap hover:[background:#23483e14] [&_svg]:w-[18px] [&_svg]:h-[18px]"
        >
          <ChevronLeft /> На сайт
        </Link>
        <input
          className="min-w-0 max-w-[34vw] py-[7px] px-[10px] border border-solid border-[transparent] rounded-[10px] [background:transparent] text-ink [font-family:var(--serif)] text-[22px] font-medium focus:border-linen focus:[background:#f5f1e8] focus:[outline:none] hover:border-linen hover:[background:#f5f1e8] hover:[outline:none] max-[1000px]:max-w-none max-[1000px]:text-[18px]"
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
        <span className="text-hedge whitespace-nowrap max-[1000px]:hidden">
          {count} {plural(count, "бирка", "бирки", "бирок")} · {printer.name}
        </span>
        <Toolbar onOpen={open} />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-[8px] min-h-[38px] py-[8px] px-[16px] border border-solid border-linen rounded-[10px] [background:#23483e] whitespace-nowrap border-forest text-[#fff] hover:disabled:border-forest hover:disabled:[background:#15372e] [&_svg]:w-[18px] [&_svg]:h-[18px] primary"
          onClick={() => setDialog("export")}
        >
          <Download /> Печать
        </button>
      </header>

      {notice && <Notice text={notice} onClose={() => setNotice("")} />}

      <main
        className={
          panel
            ? "grid grid-cols-[minmax(0,1fr)_380px] flex-[1] min-h-0 [@media(max-width:700px)]:grid-cols-[minmax(0,1fr)]"
            : "grid grid-cols-[minmax(0,1fr)] flex-[1] min-h-0 no-panel"
        }
      >
        <section className="flex flex-col min-w-0 min-h-0" aria-label="3D-вид">
          <StageBar />
          <div className="relative flex-[1] min-h-0 [background:radial-gradient(ellipse_at_50%_12%,#ffffffcc,transparent_58%),linear-gradient(#ece8dc,#dcd8ca)] max-[1000px]:min-h-[240px] [&_canvas]:block">
            <Viewport />
          </div>
          <div className="grid flex-wrap gap-[4px_16px] py-[8px] px-[16px] border-top-[1px] border-top-[#e6e2da] text-hedge tabular-nums grid-cols-[auto_1fr] mb-[14px] [&_dt]:text-hedge [&_dd]:m-0 [&_dd]:font-semibold">
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
