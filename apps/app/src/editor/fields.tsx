"use client";

import { type ReactNode, useEffect, useId, useState } from "react";

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
  const [text, setText] = useState(format(value));
  // Follow outside changes without clobbering a number being typed ("2.").
  useEffect(() => {
    if (Number(text) !== value) setText(format(value));
  }, [text, value]);
  const commit = (raw: string) => {
    setText(raw);
    const parsed = Number(raw);
    if (raw.trim() && Number.isFinite(parsed))
      onChange(Math.min(max, Math.max(min, parsed)));
  };
  return (
    <div className="brk-field">
      <label className="brk-field-label" htmlFor={`${id}-range`}>
        {label}
      </label>
      <div className="brk-number">
        <input
          id={`${id}-range`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="brk-number-box">
          <input
            id={`${id}-exact`}
            type="number"
            inputMode="decimal"
            aria-label={label}
            min={min}
            max={max}
            step={step}
            value={text}
            onChange={(event) => commit(event.target.value)}
            onBlur={() => setText(format(value))}
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
    <div className="brk-field">
      <span className="brk-field-label">{label}</span>
      <div className="brk-seg" role="radiogroup" aria-label={label}>
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
      className="brk-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="brk-switch-track" aria-hidden="true">
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
    <section className="brk-section">
      <div className="brk-section-head">
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
    <div className="brk-swatches" role="radiogroup" aria-label="Цвет">
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
