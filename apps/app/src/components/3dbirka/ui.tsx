"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useRef,
} from "react";
import { colorPairs, getTagVisual, type ShapeId, shapeToSeries } from "./data";
import { money, type View } from "./shared";
import { wrapName } from "./tag-config";
import { ThemedTagSvg } from "./themed-tag-svg";

export function RollingNumber({ value }: { value: number }) {
  return (
    <span className="inline-flex relative overflow-hidden align-bottom tabular-nums [&>span]:inline-block">
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
      className="absolute inset-0 z-[-1] rounded-[inherit] [background:#e4e9d8] shadow-[0_2px_8px_#00000010] pointer-events-none"
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
        drawer
          ? "overflow-hidden fixed inset-0 w-full h-full max-w-none max-h-[none] m-0 border-0 text-[inherit] [background:transparent] items-center justify-center p-[20px] flex [backdrop-filter:blur(8px)] p-0 justify-end"
          : "overflow-hidden fixed inset-0 w-full h-full max-w-none max-h-[none] m-0 border-0 text-[inherit] [background:transparent] items-center justify-center p-[20px] flex [backdrop-filter:blur(8px)]"
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
            "button:enabled, input:enabled, a[href], [tabindex='0']",
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
        className="absolute inset-0 border-0 [background:transparent] cursor-default"
        tabIndex={-1}
        aria-label="Закрыть окно"
        onClick={onClose}
      />
      <motion.div
        initial={drawer ? { x: "100%" } : { opacity: 0, y: 22, scale: 0.97 }}
        animate={{ x: 0, opacity: 1, y: 0, scale: 1 }}
        exit={drawer ? { x: "100%" } : { opacity: 0, y: 22, scale: 0.97 }}
        transition={{ type: "spring", damping: 32, stiffness: 270 }}
        className={
          drawer
            ? "h-full w-[min(100%,520px)] overflow-y-auto [background:#f5f1e8] p-[32px] flex flex-col relative border-left-[1px] border-left-[#ffffff80] max-[570px]:p-[20px] [&_h2]:font-[400] [&_h2]:text-[40px] [&_h2]:leading-[1.1] [&_h2]:[font-family:Georgia,serif] [&_h2]:mt-[13px] [&_h2]:mb-[14px] [&_h2]:mb-[25px] [&_h2]:font-display [&_h2]:text-[43px]"
            : "relative w-[min(100%,520px)] max-h-[calc(100vh_-_40px)] overflow-y-auto [background:#fffef8ed] rounded-[28px] p-[48px] shadow-[0_30px_90px_#0005] border border-solid border-[#ffffff88] [backdrop-filter:blur(24px)] max-[570px]:py-[35px] max-[570px]:px-[24px] [&_h2]:font-[400] [&_h2]:text-[40px] [&_h2]:leading-[1.1] [&_h2]:[font-family:Georgia,serif] [&_h2]:mt-[13px] [&_h2]:mb-[14px] [&_h2]:font-display [&_h2]:text-[43px] max-[570px]:[&_h2]:text-[38px]"
        }
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
  itemIndex = 0,
}: {
  shape: ShapeId;
  color: number;
  name: string;
  view?: View;
  small?: boolean;
  itemIndex?: number;
}) {
  const series = shapeToSeries(shape);
  const viewThemed: Record<View, string> = {
    front: "[transform:rotate(-4deg)]",
    side: "[transform:rotateY(58deg)_rotate(-3deg)]",
    rotate: "[transform:rotate(-4deg)] animate-birka-spin",
  };
  const viewLabel: Record<View, string> = {
    front: "[transform:rotate(-7deg)_rotateY(-13deg)]",
    side: "[transform:rotate(-5deg)_rotateY(75deg)]",
    rotate: "[transform:rotate(-7deg)] animate-birka-spin",
  };
  const shapeBox: Record<string, string> = {
    stake: "w-[290px] h-[136px] rounded-[21px]",
    flag: "w-[290px] h-[136px] rounded-[13px_22px_22px_13px]",
    hanging: "w-[275px] h-[132px] rounded-[20px]",
  };
  const box = shapeBox[shape] ?? shapeBox.stake;
  if (series !== "classic") {
    const visual = getTagVisual(shape, color, name, itemIndex);
    return (
      <div
        className={`relative w-full h-[330px] flex items-center justify-center [perspective:900px] ${small ? "h-full [transform:scale(.52)] origin-[center_center]" : ""}`}
        role="img"
        aria-label={`Бирка: ${name || "ваша надпись"}`}
      >
        <div
          className={`w-[210px] h-[248px] grid place-items-center [filter:drop-shadow(0_16px_22px_#10201938)] ${viewThemed[view]} [transition:transform_0.45s_cubic-bezier(0.22,1,0.36,1)] z-[1]`}
        >
          <ThemedTagSvg visual={visual} name={name} />
        </div>
        {!small && (
          <div className="absolute bottom-[13px] w-[230px] h-[32px] [background:#434f3d31] [filter:blur(20px)] rounded-full" />
        )}
      </div>
    );
  }
  const pair = colorPairs[color] ?? colorPairs[0];
  const lines = wrapName(name || "Ваш сорт");
  const longestLine = Math.max(
    ...lines.map((line) => Array.from(line).length),
    1,
  );
  return (
    <div
      className={`relative w-full h-[330px] flex items-center justify-center [perspective:900px] ${small ? "h-full [transform:scale(.52)] origin-[center_center]" : ""}`}
      role="img"
      aria-label={`Бирка: ${name || "ваша надпись"}`}
    >
      <div
        className={`relative ${box} [background:var(--label-base)] text-[var(--label-ink)] flex items-center justify-center py-[14px] px-[20px] shadow-[inset_0_2px_3px_#ffffff55,inset_0-5px_5px_#00000020,10px_18px_20px_#1d291d3b] ${viewLabel[view]} [transition:transform_.45s] z-[1] after:content-[''] after:absolute after:inset-[7px] after:border after:border-solid after:border-[currentColor] after:rounded-[15px] after:opacity-[.14] after:pointer-events-none`}
        style={
          {
            "--label-base": pair.base,
            "--label-ink": pair.ink,
          } as CSSProperties
        }
      >
        {shape === "hanging" && (
          <span className="absolute top-[8px] left-[calc(50%_-_7px)] w-[14px] h-[14px] rounded-full [background:#d5d5ca] shadow-[inset_0_0_3px_#0006]" />
        )}
        <span
          className="block text-[27px] leading-[1.15] font-extrabold text-center wrap-anywhere [text-shadow:1px_1px_0#00000020] max-h-[100%] overflow-hidden"
          style={{ fontSize: `min(27px, ${140 / longestLine}cqw)` }}
        >
          {lines.join("\n")}
        </span>
        {shape !== "hanging" && (
          <span className="absolute top-[calc(100%_-_2px)] left-[calc(50%_-_16px)] w-[32px] h-[160px] [background:var(--label-base)] [clip-path:polygon(0_0,100%0,87%_85%,50%_100%,13%_85%)] shadow-[inset_-5px_0_5px_#0000001a]" />
        )}
      </div>
      {!small && (
        <div className="absolute bottom-[13px] w-[230px] h-[32px] [background:#434f3d31] [filter:blur(20px)] rounded-full" />
      )}
    </div>
  );
}
