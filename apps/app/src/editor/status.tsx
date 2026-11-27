"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import type { Issue } from "./model/checks";

/** Findings of the printability check for the tag being shown. */
export function CheckList({ issues }: { issues: Issue[] }) {
  if (!issues.length)
    return (
      <p className="flex flex-wrap gap-[6px] m-0 py-[10px] px-[16px] border-top-[1px] border-top-[#e6e2da] list-none [background:var(--paper)] items-center text-[var(--ok)] [&_li]:flex [&_li]:items-start [&_li]:gap-[6px] [&_li]:max-w-[100%] [&_li]:py-[5px] [&_li]:px-[10px] [&_li]:rounded-[8px] [&_li]:[background:#23483e0d] ok">
        <CircleCheck /> Замечаний нет — можно печатать
      </p>
    );
  return (
    <ul
      className="flex flex-wrap gap-[6px] m-0 py-[10px] px-[16px] border-top-[1px] border-top-[#e6e2da] list-none [background:var(--paper)] items-center text-[var(--ok)] [&_li]:flex [&_li]:items-start [&_li]:gap-[6px] [&_li]:max-w-[100%] [&_li]:py-[5px] [&_li]:px-[10px] [&_li]:rounded-[8px] [&_li]:[background:#23483e0d]"
      aria-label="Проверка печати"
    >
      {issues.map((issue) => (
        <li key={issue.message} className={issue.level}>
          {issue.level === "error" ? (
            <CircleAlert />
          ) : issue.level === "warning" ? (
            <CircleAlert />
          ) : (
            <Info />
          )}
          <span>{issue.message}</span>
        </li>
      ))}
    </ul>
  );
}

/** Dismissible message about a saved or opened project. */
export function Notice({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  return (
    <p
      className="flex items-center justify-center gap-[8px] m-0 py-[8px] px-[16px] border-bottom-[1px] border-bottom-[#e6e2da] [background:#e9c98155] text-center [&_svg]:w-[16px] [&_svg]:h-[16px] [&_button]:grid [&_button]:place-items-center [&_button]:border-0 [&_button]:[background:none]"
      role="status"
    >
      {text}
      <button type="button" aria-label="Закрыть сообщение" onClick={onClose}>
        <X />
      </button>
    </p>
  );
}
