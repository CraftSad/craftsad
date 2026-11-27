"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { downloadBlob, downloadText, plural } from "./lib";
import {
  batchNames,
  exportPrint,
  fileName,
  type PrintExport,
} from "./model/export/print";
import { parseProject, serializeProject } from "./model/export/project";
import { layoutPlate } from "./model/plate";
import { printer } from "./model/printer";
import { type Template, templates } from "./model/templates";
import { useEditor } from "./store";

/** Density of PLA, grammes per cubic millimetre. */
const PLA = 0.00124;

function Modal({
  title,
  wide,
  onClose,
  children,
}: {
  title: string;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    // Clicking the backdrop mirrors Esc and the close button.
    // biome-ignore lint/a11y/useKeyWithClickEvents: the dialog already closes on Escape
    <dialog
      ref={ref}
      className={
        wide
          ? "m-[auto] max-w-[calc(100vw_-_32px)] p-0 border-0 rounded-[16px] [background:#10241c80] text-ink shadow-[0_24px_60px_#10241c66] w-[520px] [backdrop-filter:blur(3px)] wide"
          : "m-[auto] max-w-[calc(100vw_-_32px)] p-0 border-0 rounded-[16px] [background:#10241c80] text-ink shadow-[0_24px_60px_#10241c66] w-[520px] [backdrop-filter:blur(3px)]"
      }
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="p-[20px]">
        <header className="flex items-center justify-between gap-[12px] mb-[8px] [&_svg]:w-[18px] [&_svg]:h-[18px] [&_h2]:m-0 [&_h2]:text-forest [&_h2]:[font-family:var(--serif)] [&_h2]:text-[26px] [&_h2]:font-medium [&_button]:grid [&_button]:place-items-center [&_button]:w-[36px] [&_button]:h-[36px] [&_button]:border-0 [&_button]:rounded-full [&_button]:[background:#f5f1e8]">
          <h2>{title}</h2>
          <button type="button" aria-label="Закрыть" onClick={onClose}>
            <X />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

/** Flat outline of a template's plate and stake, as a small inline picture. */
function TemplatePicture({ template }: { template: Template }) {
  const { shape, mount } = template.project.tag;
  const stake = mount.type === "stake" ? mount : null;
  const stakeHeight = stake ? stake.length - 8 : 0;
  const width = 120;
  const plateWidth = 84;
  const scale = plateWidth / shape.width;
  const plateHeight = shape.height * scale;
  const height =
    plateHeight + 6 + (stake ? Math.min(stakeHeight, 70) * scale : 0) + 6;
  const x = (width - plateWidth) / 2;
  const y = 4;
  const radius =
    shape.kind === "ellipse"
      ? "50%"
      : shape.kind === "tongue"
        ? `${plateWidth / 2}`
        : Math.min(shape.radius * scale, plateWidth / 2, plateHeight / 2);
  const stakeX = stake
    ? stake.side === "left"
      ? x + (stake.width * scale) / 2 + 2
      : stake.side === "right"
        ? x + plateWidth - (stake.width * scale) / 2 - 2
        : width / 2
    : 0;
  const stakeWidth = stake ? Math.max(stake.width * scale, 3) : 0;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      className="self-center mb-[6px]"
    >
      {stake && (
        <path
          d={`M${stakeX - stakeWidth / 2} ${y + plateHeight - 2}v${height - y - plateHeight - 4}l${stakeWidth / 2} 4 ${stakeWidth / 2} -4v${-(height - y - plateHeight - 4)}z`}
          fill="#9fb3a6"
        />
      )}
      <rect
        x={x}
        y={y}
        width={plateWidth}
        height={plateHeight}
        rx={radius}
        fill={template.project.colors.body}
        stroke="#203c3233"
      />
      {mount.type === "hole" && (
        <circle
          cx={width / 2}
          cy={y + mount.margin * scale}
          r={(mount.diameter * scale) / 2}
          fill="#e9e6dc"
        />
      )}
      {mount.type === "screws" && (
        <>
          <circle
            cx={x + mount.margin * scale}
            cy={y + plateHeight / 2}
            r={(mount.diameter * scale) / 2}
            fill="#e9e6dc"
          />
          <circle
            cx={x + plateWidth - mount.margin * scale}
            cy={y + plateHeight / 2}
            r={(mount.diameter * scale) / 2}
            fill="#e9e6dc"
          />
        </>
      )}
      {[0.3, 0.58].map((part, index) =>
        template.project.tag.layers.length > index ? (
          <rect
            key={index}
            x={width / 2 - (plateWidth * (0.62 - index * 0.18)) / 2}
            y={y + plateHeight * part - 2}
            width={plateWidth * (0.62 - index * 0.18)}
            height={index ? 3 : 5}
            rx={2}
            fill={template.project.colors.relief}
            opacity={0.55}
          />
        ) : null,
      )}
    </svg>
  );
}

export function TemplatesDialog() {
  const open = useEditor((state) => state.dialog === "templates");
  if (!open) return null;
  return (
    <Modal
      title="Заготовки"
      wide
      onClose={() => useEditor.getState().setDialog(null)}
    >
      <p className="mb-[14px] text-hedge">
        Заготовка — готовая бирка: форма, крепление, шрифт и цвет. Выберите
        близкую и поправьте под себя. Текущий проект будет заменён.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[12px]">
        {templates.map((template) => (
          <button
            type="button"
            key={template.id}
            className="flex flex-col items-start gap-[2px] p-[14px] border border-solid border-linen rounded-[14px] [background:#f5f1e8] text-left hover:border-forest hover:[transform:translateY(-2px)] hover:[transition:translate_0.12s]"
            onClick={() => {
              useEditor.getState().replace(structuredClone(template.project));
              useEditor.getState().setDialog(null);
            }}
          >
            <TemplatePicture template={template} />
            <strong>{template.title}</strong>
            <span>{template.hint}</span>
            <small>
              {template.project.tag.shape.width} ×{" "}
              {template.project.tag.shape.height} мм
            </small>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/** How the batch fits the printer bed; an unbuilt tag counts as 60 × 30 mm. */
function useBatchFit() {
  const project = useEditor((state) => state.project);
  const size = useEditor((state) => state.built?.size) ?? { x: 60, y: 30 };
  const count = batchNames(project).length;
  const capacity = layoutPlate(
    size,
    count,
    project.batch.gap,
    project.batch.margin,
  ).capacity;
  return { count, capacity, fits: count <= capacity };
}

/** What the user needs to know before the file reaches the slicer. */
function PrintSummary() {
  const built = useEditor((state) => state.built);
  const { count, capacity, fits } = useBatchFit();
  const grams = built
    ? (built.volume * PLA * count).toLocaleString("ru-RU", {
        maximumFractionDigits: 1,
      })
    : null;
  return (
    <dl className="grid flex-wrap gap-[4px_16px] py-[8px] px-[16px] border-top-[1px] border-top-[#e6e2da] text-hedge tabular-nums grid-cols-[auto_1fr] mb-[14px] [&_dt]:text-hedge [&_dd]:m-0 [&_dd]:font-semibold">
      <div>
        <dt>Принтер</dt>
        <dd>
          {printer.name} · стол {printer.bed.x} × {printer.bed.y} мм
        </dd>
      </div>
      {built && (
        <div>
          <dt>Размер бирки</dt>
          <dd>
            {built.size.x.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}{" "}
            ×{" "}
            {built.size.y.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}{" "}
            ×{" "}
            {built.size.z.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}{" "}
            мм
          </dd>
        </div>
      )}
      <div>
        <dt>Партия</dt>
        <dd>
          {count} {plural(count, "бирка", "бирки", "бирок")}
          {!fits && ` — на стол помещается только ${capacity}`}
        </dd>
      </div>
      {grams && (
        <div>
          <dt>Пластика</dt>
          <dd>≈ {grams} г</dd>
        </div>
      )}
    </dl>
  );
}

export function ExportDialog() {
  const project = useEditor((state) => state.project);
  const issues = useEditor((state) => state.issues);
  const { fits, capacity, count } = useBatchFit();
  const [format, setFormat] = useState<"3mf" | "stl">("3mf");
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<PrintExport | null>(null);
  const [error, setError] = useState("");
  const close = () => useEditor.getState().setDialog(null);
  // Errors make a print impossible; a batch that leaves the bed is cut short
  // by the slicer, so it is refused here with the reason shown.
  const blocked =
    issues.some((issue) => issue.level === "error") ||
    !fits ||
    progress !== null;
  const chooseFormat = (next: "3mf" | "stl") => {
    setFormat(next);
    // A file of the other format says nothing about this one.
    setResult(null);
  };
  const prepare = async () => {
    setResult(null);
    setError("");
    setProgress(0);
    try {
      const file = await exportPrint(project, format, (done, total) =>
        setProgress(total ? done / total : 1),
      );
      setResult(file);
      downloadBlob(file.blob, file.filename);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setProgress(null);
    }
  };
  return (
    <Modal title="Печать на QIDI Plus 5" onClose={close}>
      <PrintSummary />
      <div className="block my-[10px] mx-[0]">
        <span className="block mb-[5px] text-hedge text-[13px]">
          Формат файла
        </span>
        <div
          className="inline-flex p-[3px] border border-solid border-linen rounded-[10px] [background:#f5f1e8] [&>button]:min-h-[30px] [&>button]:py-[4px] [&>button]:px-[12px] [&>button]:border-0 [&>button]:rounded-[8px] [&>button]:[background:none] [&>button]:text-hedge [&>button]:whitespace-nowrap [&>button]:flex-[1] [&>button[aria-pressed=true]]:[background:#23483e] [&>button[aria-pressed=true]]:text-[#fff] [&>button[aria-checked=true]]:[background:#23483e] [&>button[aria-checked=true]]:text-[#fff] [&>button[aria-selected=true]]:[background:#23483e] [&>button[aria-selected=true]]:text-[#fff] [&>button:hover:not(:disabled]:text-ink"
          role="radiogroup"
          aria-label="Формат файла"
        >
          <button
            type="button"
            role="radio"
            aria-checked={format === "3mf"}
            onClick={() => chooseFormat("3mf")}
          >
            3MF · два цвета
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={format === "stl"}
            onClick={() => chooseFormat("stl")}
          >
            STL · один цвет
          </button>
        </div>
      </div>
      <ol className="mb-[12px] pl-[20px] [&_li]:my-[6px] [&_li]:mx-[0]">
        {format === "3mf" ? (
          <li>
            <strong>Откройте файл в QIDI Studio.</strong> Бирки уже расставлены
            на столе {printer.bed.x} × {printer.bed.y} мм.
          </li>
        ) : count > 1 ? (
          <li>
            <strong>Распакуйте ZIP-архив.</strong> Импортируйте файлы STL и
            расставьте модели на столе в QIDI Studio.
          </li>
        ) : (
          <li>
            <strong>Импортируйте файл STL в QIDI Studio.</strong> Разместите
            модель на столе.
          </li>
        )}
        {format === "3mf" ? (
          <li>
            <strong>Назначьте филаменты.</strong> Корпус — экструдер 1, надпись
            — экструдер 2. Слайсер сам добавит второй филамент. Без QIDI Box
            смена цвета пройдёт по команде M600.
          </li>
        ) : (
          <li>
            <strong>Один цвет.</strong> Все бирки объединены в цельные модели;
            надпись видна за счёт объёма. Для второго цвета выберите 3MF.
          </li>
        )}
        <li>
          <strong>Слои и рельеф.</strong> Рельеф{" "}
          {project.tag.reliefDepth.toLocaleString("ru-RU")} мм — это{" "}
          {Math.round(project.tag.reliefDepth / printer.layerHeight)} слоя по{" "}
          {printer.layerHeight} мм; высоту слоя не меняйте.
        </li>
      </ol>
      {issues.length > 0 && (
        <ul className="grid gap-[6px] max-h-[160px] mb-[12px] p-0 overflow-y-auto list-none">
          {issues.map((issue) => (
            <li
              key={issue.message}
              className={`[background:#c4663d26] py-[6px] px-[10px] rounded-[8px] ${issue.level}`}
            >
              {issue.message}
            </li>
          ))}
        </ul>
      )}
      {!fits && (
        <p
          className="my-[8px] mx-[0] py-[8px] px-[10px] rounded-[8px] [background:#c4663d26]"
          role="alert"
        >
          Партия не помещается на стол: {count}{" "}
          {plural(count, "бирка", "бирки", "бирок")}, а влезает {capacity}.
          Уменьшите зазор или число экземпляров на вкладке «Партия».
        </p>
      )}
      {error && (
        <p
          className="my-[8px] mx-[0] py-[8px] px-[10px] rounded-[8px] [background:#c4663d26]"
          role="alert"
        >
          {error}
        </p>
      )}
      {progress !== null && (
        <progress
          className="w-full my-[8px] mx-[0] [accent-color:#23483e]"
          max={1}
          value={progress}
          aria-label="Подготовка файла"
        />
      )}
      {result && (
        <p
          className="my-[8px] mx-[0] py-[8px] px-[10px] rounded-[8px] [background:#23483e0d] tabular-nums"
          role="status"
        >
          Готово: {result.filename} скачан — {result.count}{" "}
          {plural(result.count, "бирка", "бирки", "бирок")}
          {result.twoColour ? ", надпись отдельным цветом" : ""}.
        </p>
      )}
      <div className="flex flex-wrap gap-[10px] mt-[14px]">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-[8px] min-h-[38px] py-[8px] px-[16px] border border-solid border-linen rounded-[10px] [background:#23483e] whitespace-nowrap border-forest text-[#fff] hover:disabled:border-forest hover:disabled:[background:#15372e] [&_svg]:w-[18px] [&_svg]:h-[18px] primary"
          disabled={blocked || progress !== null}
          onClick={prepare}
        >
          {result ? "Скачать ещё раз" : "Скачать файл для печати"}
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-[8px] min-h-[38px] py-[8px] px-[16px] border border-solid border-linen rounded-[10px] [background:#23483e] whitespace-nowrap border-forest text-[#fff] hover:disabled:border-forest hover:disabled:[background:#15372e] [&_svg]:w-[18px] [&_svg]:h-[18px]"
          onClick={() =>
            downloadText(
              serializeProject(project),
              `${fileName(project.title)}.birka.json`,
            )
          }
        >
          Сохранить проект
        </button>
      </div>
    </Modal>
  );
}
