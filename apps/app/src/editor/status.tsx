"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import type { Issue } from "./model/checks";

/** Findings of the printability check for the tag being shown. */
export function CheckList({ issues }: { issues: Issue[] }) {
  if (!issues.length)
    return (
      <p className="brk-checks ok">
        <CircleCheck /> Замечаний нет — можно печатать
      </p>
    );
  return (
    <ul className="brk-checks" aria-label="Проверка печати">
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
    <p className="brk-notice" role="status">
      {text}
      <button type="button" aria-label="Закрыть сообщение" onClick={onClose}>
        <X />
      </button>
    </p>
  );
}
