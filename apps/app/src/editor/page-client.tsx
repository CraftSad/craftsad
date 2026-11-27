"use client";

import dynamic from "next/dynamic";

/** The editor runs entirely in the browser: WebGL, WASM and fonts. */
const TagEditor = dynamic(
  () => import("./editor").then((mod) => mod.TagEditor),
  {
    ssr: false,
    loading: () => (
      <div className="grid place-items-center min-h-[60vh] text-hedge">
        Открываем редактор…
      </div>
    ),
  },
);

export function EditorPage() {
  return <TagEditor />;
}
