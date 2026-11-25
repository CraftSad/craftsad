"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useRef,
} from "react";
import { colorPairs, type ShapeId } from "./data";
import { money, type View } from "./shared";
import { wrapName } from "./tag-config";

export function RollingNumber({ value }: { value: number }) {
  return (
    <span className="birka-rolling">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "65%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-65%", opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {money(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Pill({ active, group }: { active: boolean; group: string }) {
  return active ? (
    <motion.span
      className="birka-active-pill"
      layoutId={group}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
    />
  ) : null;
}

export function StorefrontDialog({
  children,
  drawer = false,
  titleId,
  onClose,
}: {
  children: ReactNode;
  drawer?: boolean;
  titleId: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const opener = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={
        drawer ? "birka-overlay birka-drawer-overlay" : "birka-overlay"
      }
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button:enabled, input:enabled, [tabindex='0']",
          ),
        ).filter(
          (control) => control.tabIndex >= 0 && control.getClientRects().length,
        );
        const first = controls.at(0);
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <button
        type="button"
        className="birka-backdrop"
        tabIndex={-1}
        aria-label="Закрыть окно"
        onClick={onClose}
      />
      <motion.div
        initial={drawer ? { x: "100%" } : { opacity: 0, y: 22, scale: 0.97 }}
        animate={{ x: 0, opacity: 1, y: 0, scale: 1 }}
        exit={drawer ? { x: "100%" } : { opacity: 0, y: 22, scale: 0.97 }}
        transition={{ type: "spring", damping: 32, stiffness: 270 }}
        className={drawer ? "birka-drawer" : "birka-modal"}
      >
        {children}
      </motion.div>
    </dialog>
  );
}

export function LabelPreview({
  shape,
  color,
  name,
  view = "front",
  small = false,
}: {
  shape: ShapeId;
  color: number;
  name: string;
  view?: View;
  small?: boolean;
}) {
  const pair = colorPairs[color] ?? colorPairs[0];
  const lines = wrapName(name || "Ваш сорт");
  const longestLine = Math.max(
    ...lines.map((line) => Array.from(line).length),
    1,
  );
  return (
    <div
      className={`birka-preview ${small ? "birka-preview-small" : ""} birka-preview-${view}`}
      role="img"
      aria-label={`Бирка: ${name || "ваша надпись"}`}
    >
      <div
        className={`birka-label birka-label-${shape}`}
        style={
          {
            "--label-base": pair.base,
            "--label-ink": pair.ink,
          } as CSSProperties
        }
      >
        {shape === "hanging" && <span className="birka-label-hole" />}
        <span
          className="birka-label-text"
          style={{ fontSize: `min(27px, ${140 / longestLine}cqw)` }}
        >
          {lines.join("\n")}
        </span>
        {shape !== "hanging" && <span className="birka-label-stem" />}
      </div>
      {!small && <div className="birka-preview-shadow" />}
    </div>
  );
}
