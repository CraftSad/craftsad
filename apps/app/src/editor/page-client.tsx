"use client";

import dynamic from "next/dynamic";
import "~/editor/editor.css";

/** The editor runs entirely in the browser: WebGL, WASM and fonts. */
const TagEditor = dynamic(
  () => import("./editor").then((mod) => mod.TagEditor),
  {
    ssr: false,
    loading: () => <div className="brk-boot">Открываем редактор…</div>,
  },
);

export function EditorPage() {
  return <TagEditor />;
}
