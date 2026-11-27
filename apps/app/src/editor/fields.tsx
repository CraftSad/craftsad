"use client";

import { type ReactNode, useId, useState } from "react";

const format = (value: number) => String(Math.round(value * 100) / 100);

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
};

/** A slider with an exact number input next to it. */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "мм",
}: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (raw: string) => {
    setDraft(null);
    const parsed = Number(raw);
    if (raw.trim() && Number.isFinite(parsed))
      onChange(Math.min(max, Math.max(min, parsed)));
  };
  return (
    <div className="block my-[10px] mx-[0]">
      <label
        className="block mb-[5px] text-hedge text-[13px]"
        htmlFor={`${id}-range`}
      >
        {label}
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-[10px] [&_input[type=range]]:w-full [&_input[type=range]]:min-w-0 [&_input[type=range]]:[accent-color:#23483e]">
        <input
          id={`${id}-range`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="flex items-center border border-solid border-linen rounded-[8px] [background:#f5f1e8] focus-within:border-forest [&_input]:w-full [&_input]:min-w-0 [&_input]:pt-[6px] [&_input]:pr-[4px] [&_input]:pb-[6px] [&_input]:pl-[8px] [&_input]:border-0 [&_input]:[background:none] [&_input]:text-ink [&_input]:[font:inherit] [&_input]:text-right [&_input]:appearance-textfield [&_input::-webkit-inner-spin-button]:m-0 [&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:m-0 [&_input::-webkit-outer-spin-button]:appearance-none [&>span]:pr-[8px] [&>span]:text-hedge">
          <input
            id={`${id}-exact`}
            type="number"
            inputMode="decimal"
            aria-label={label}
            min={min}
            max={max}
            step={step}
            value={draft ?? format(value)}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onBlur={(event) => {
              if (draft !== null) commit(event.currentTarget.value);
              else setDraft(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          />
          <span aria-hidden="true">{unit}</span>
        </span>
      </div>
    </div>
  );
}

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="block my-[10px] mx-[0]">
      <span className="block mb-[5px] text-hedge text-[13px]">{label}</span>
      <div
        className="inline-flex p-[3px] border border-solid border-linen rounded-[10px] [background:#f5f1e8] [&>button]:min-h-[30px] [&>button]:py-[4px] [&>button]:px-[12px] [&>button]:border-0 [&>button]:rounded-[8px] [&>button]:[background:none] [&>button]:text-hedge [&>button]:whitespace-nowrap [&>button]:flex-[1] [&>button[aria-pressed=true]]:[background:#23483e] [&>button[aria-pressed=true]]:text-[#fff] [&>button[aria-checked=true]]:[background:#23483e] [&>button[aria-checked=true]]:text-[#fff] [&>button[aria-selected=true]]:[background:#23483e] [&>button[aria-selected=true]]:text-[#fff] [&>button:hover:not(:disabled]:text-ink"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            role="radio"
            aria-checked={option.id === value}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="flex items-center gap-[10px] w-full py-[6px] px-[0] border-0 [background:none] font-semibold text-left"
      onClick={() => onChange(!checked)}
    >
      <span
        className="relative shrink-0 w-[40px] h-[22px] rounded-full [background:#b9b5a8] [transition:background_0.15s] [&>span]:absolute [&>span]:top-[3px] [&>span]:left-[3px] [&>span]:w-[16px] [&>span]:h-[16px] [&>span]:rounded-full [&>span]:[background:#fff] [&>span]:[transition:translate_0.15s] [&>span]:[translate:18px_0]"
        aria-hidden="true"
      >
        <span />
      </span>
      {label}
    </button>
  );
}

export function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="py-[14px] px-[0] border-bottom-[1px] border-bottom-[#e6e2da] [&_h3]:m-0 [&_h3]:text-forest [&_h3]:[font-family:var(--serif)] [&_h3]:text-[19px] [&_h3]:font-medium">
      <div className="flex items-baseline justify-between gap-[12px] mb-[8px]">
        <h3>{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Palette of ready-made body/lettering colour pairs. */
export function Swatches({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly { label: string; value: string; contrast: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-[8px] [&>button]:grid [&>button]:place-items-center [&>button]:w-[36px] [&>button]:h-[36px] [&>button]:border-[2px] [&>button]:border-solid [&>button]:border-[transparent] [&>button]:rounded-full [&>button]:[font-family:var(--serif)] [&>button]:text-[17px] [&>button[aria-checked=true]]:border-forest [&>button[aria-checked=true]]:shadow-[inset_0_0_0_2px_var(--paper)]"
      role="radiogroup"
      aria-label="Цвет"
    >
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          aria-label={option.label}
          title={option.label}
          style={{ background: option.value, color: option.contrast }}
          onClick={() => onChange(option.value)}
        >
          А
        </button>
      ))}
    </div>
  );
}
