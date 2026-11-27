"use client";

import { ArrowDown, ArrowUp, Layers, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { NumberField, Section, Segmented, Swatches, Toggle } from "./fields";
import { plural } from "./lib";
import { batchNames } from "./model/export/print";
import { fontDef, fontFamily, fontGroups, fonts } from "./model/fonts";
import { layoutPlate } from "./model/plate";
import { printer } from "./model/printer";
import {
  MAX_LAYERS,
  type Mount,
  NAME_TOKEN,
  type TagDesign,
  type TextLayer,
} from "./model/schema";
import { findTemplate } from "./model/templates";
import { activeName, useEditor } from "./store";

type Block = (draft: TagDesign) => void;

/** Edits the tag design; a shared `group` makes one undo step per control. */
function editTag(recipe: Block, group: string) {
  useEditor.getState().update((draft) => recipe(draft.tag), group);
}

/** Filaments the storefront offers, plus plain white and black. */
const PLASTICS = [
  { label: "Молочный", value: "#f4efe4", contrast: "#26302a" },
  { label: "Хвойный", value: "#28513e", contrast: "#ffffff" },
  { label: "Терракотовый", value: "#ae6849", contrast: "#ffffff" },
  { label: "Графитовый", value: "#343935", contrast: "#e9c981" },
  { label: "Солнечный", value: "#e6c963", contrast: "#26302a" },
  { label: "Песочный", value: "#ddc6a4", contrast: "#563d2d" },
  { label: "Белый", value: "#ffffff", contrast: "#26302a" },
  { label: "Чёрный", value: "#202020", contrast: "#ffffff" },
];
const INKS = [
  { label: "Чёрный", value: "#26302a", contrast: "#ffffff" },
  { label: "Белый", value: "#ffffff", contrast: "#26302a" },
  { label: "Золотой", value: "#e9c981", contrast: "#26302a" },
  { label: "Коричневый", value: "#563d2d", contrast: "#ffffff" },
  { label: "Красный", value: "#b3362a", contrast: "#ffffff" },
  { label: "Синий", value: "#2c5580", contrast: "#ffffff" },
  { label: "Зелёный", value: "#2f6b35", contrast: "#ffffff" },
  { label: "Молочный", value: "#f4efe4", contrast: "#26302a" },
];
type Mounted = Exclude<Mount, { type: "none" }>;
const DEFAULT_MOUNTS: Record<Mounted["type"], Mounted> = {
  stake: { type: "stake", length: 70, width: 8, tipLength: 12, side: "center" },
  hole: { type: "hole", diameter: 4, margin: 6 },
  screws: { type: "screws", diameter: 3.5, margin: 6 },
};
const SLOTS = [
  { id: "top", label: "Сверху" },
  { id: "middle", label: "По центру" },
  { id: "bottom", label: "Снизу" },
] as const;
const RELIEFS = [
  { id: "raised", label: "Выпуклый" },
  { id: "engraved", label: "Углублённый" },
] as const;

function ShapePanel() {
  const tag = useEditor((state) => state.project.tag);
  const template = useEditor((state) => state.project.template);
  const { shape, mount, frame } = tag;
  const curved = shape.kind !== "rounded";
  const origin = findTemplate(template)?.title ?? "Своя бирка";
  return (
    <>
      <Section
        title="Заготовка"
        aside={
          <button
            type="button"
            className="inline-flex items-center gap-[4px] p-0 border-0 [background:none] text-forest font-semibold underline [text-underline-offset:3px] [&_svg]:w-[16px] [&_svg]:h-[16px]"
            onClick={() => useEditor.getState().setDialog("templates")}
          >
            Сменить
          </button>
        }
      >
        <p className="my-[6px] mx-[0] text-hedge text-[13px]">
          {origin}. Любой параметр можно изменить — надписи сами перестроятся
          под новые размеры.
        </p>
      </Section>

      <Section title="Форма">
        <Segmented
          label="Силуэт"
          value={shape.kind}
          options={[
            { id: "rounded", label: "Плашка" },
            { id: "ellipse", label: "Овал" },
            { id: "tongue", label: "Арка" },
          ]}
          onChange={(kind) =>
            editTag((draft) => {
              draft.shape.kind = kind;
            }, "shape.kind")
          }
        />
        <NumberField
          label="Ширина"
          value={shape.width}
          min={15}
          max={200}
          onChange={(width) =>
            editTag((draft) => {
              draft.shape.width = width;
            }, "shape.width")
          }
        />
        <NumberField
          label="Высота"
          value={shape.height}
          min={10}
          max={120}
          onChange={(height) =>
            editTag((draft) => {
              draft.shape.height = height;
            }, "shape.height")
          }
        />
        {!curved && (
          <NumberField
            label="Скругление углов"
            value={shape.radius}
            min={0}
            max={60}
            onChange={(radius) =>
              editTag((draft) => {
                draft.shape.radius = radius;
              }, "shape.radius")
            }
          />
        )}
      </Section>

      <Section title="Печать">
        <NumberField
          label="Толщина плашки"
          value={tag.thickness}
          min={0.6}
          max={8}
          step={0.2}
          onChange={(thickness) =>
            editTag((draft) => {
              draft.thickness = thickness;
            }, "thickness")
          }
        />
        <NumberField
          label="Высота рельефа"
          value={tag.reliefDepth}
          min={0.2}
          max={3}
          step={0.1}
          onChange={(reliefDepth) =>
            editTag((draft) => {
              draft.reliefDepth = reliefDepth;
            }, "reliefDepth")
          }
        />
        <p className="my-[6px] mx-[0] text-hedge text-[13px]">
          Рельеф —{" "}
          {(tag.reliefDepth / printer.layerHeight).toLocaleString("ru-RU")}{" "}
          слоёв по {printer.layerHeight} мм.
        </p>
      </Section>

      <Section title="Крепление">
        <Segmented
          label="Как держится"
          value={mount.type}
          options={[
            { id: "stake", label: "Колышек" },
            { id: "hole", label: "Отверстие" },
            { id: "screws", label: "Саморезы" },
            { id: "none", label: "Без" },
          ]}
          onChange={(type) =>
            editTag((draft) => {
              draft.mount =
                type === "none"
                  ? { type: "none" }
                  : structuredClone(DEFAULT_MOUNTS[type]);
            }, "mount.type")
          }
        />
        {mount.type === "stake" && (
          <>
            <NumberField
              label="Длина колышка"
              value={mount.length}
              min={20}
              max={260}
              onChange={(length) =>
                editTag((draft) => {
                  if (draft.mount.type === "stake") draft.mount.length = length;
                }, "mount.length")
              }
            />
            <NumberField
              label="Ширина колышка"
              value={mount.width}
              min={3}
              max={20}
              onChange={(width) =>
                editTag((draft) => {
                  if (draft.mount.type === "stake") draft.mount.width = width;
                }, "mount.width")
              }
            />
            <NumberField
              label="Остриё"
              value={mount.tipLength}
              min={4}
              max={30}
              onChange={(tipLength) =>
                editTag((draft) => {
                  if (draft.mount.type === "stake")
                    draft.mount.tipLength = tipLength;
                }, "mount.tip")
              }
            />
            <Segmented
              label="Колышек"
              value={mount.side}
              options={[
                { id: "center", label: "По центру" },
                { id: "left", label: "Слева" },
                { id: "right", label: "Справа" },
              ]}
              onChange={(side) =>
                editTag((draft) => {
                  if (draft.mount.type === "stake") draft.mount.side = side;
                }, "mount.side")
              }
            />
          </>
        )}
        {(mount.type === "hole" || mount.type === "screws") && (
          <>
            <NumberField
              label={
                mount.type === "hole"
                  ? "Диаметр отверстия"
                  : "Диаметр под саморез"
              }
              value={mount.diameter}
              min={1.5}
              max={mount.type === "hole" ? 20 : 10}
              step={0.5}
              onChange={(diameter) =>
                editTag((draft) => {
                  if (
                    draft.mount.type === "hole" ||
                    draft.mount.type === "screws"
                  )
                    draft.mount.diameter = diameter;
                }, "mount.diameter")
              }
            />
            <NumberField
              label="Отступ от края"
              value={mount.margin}
              min={mount.type === "hole" ? 2 : 3}
              max={mount.type === "hole" ? 40 : 60}
              onChange={(margin) =>
                editTag((draft) => {
                  if (
                    draft.mount.type === "hole" ||
                    draft.mount.type === "screws"
                  )
                    draft.mount.margin = margin;
                }, "mount.margin")
              }
            />
          </>
        )}
      </Section>

      <Section title="Рамка">
        <Toggle
          label="Рамка по контуру"
          checked={frame.enabled}
          onChange={(enabled) =>
            editTag((draft) => {
              draft.frame.enabled = enabled;
            }, "frame.enabled")
          }
        />
        {frame.enabled && (
          <>
            <NumberField
              label="Отступ рамки"
              value={frame.inset}
              min={0.5}
              max={15}
              step={0.5}
              onChange={(inset) =>
                editTag((draft) => {
                  draft.frame.inset = inset;
                }, "frame.inset")
              }
            />
            <NumberField
              label="Толщина линии"
              value={frame.thickness}
              min={0.4}
              max={4}
              step={0.2}
              onChange={(thickness) =>
                editTag((draft) => {
                  draft.frame.thickness = thickness;
                }, "frame.thickness")
              }
            />
            <Segmented
              label="Рельеф рамки"
              value={frame.relief}
              options={[
                { id: "raised", label: "Выпуклая" },
                { id: "engraved", label: "Углублённая" },
              ]}
              onChange={(relief) =>
                editTag((draft) => {
                  draft.frame.relief = relief;
                }, "frame.relief")
              }
            />
          </>
        )}
      </Section>

      <ColorPanel />
    </>
  );
}

function ColorPanel() {
  const colors = useEditor((state) => state.project.colors);
  // Lettering printed in the plate's own plastic cannot have its own colour.
  const samePlastic = useEditor((state) => {
    const { layers, frame } = state.project.tag;
    return (
      !layers.some((layer) => layer.relief === "raised") &&
      !(frame.enabled && frame.relief === "raised")
    );
  });
  return (
    <Section title="Цвет">
      <div className="block my-[10px] mx-[0]">
        <span className="block mb-[5px] text-hedge text-[13px]">
          Пластик плашки
        </span>
        <Swatches
          value={colors.body}
          options={PLASTICS}
          onChange={(body) =>
            useEditor.getState().update((draft) => {
              draft.colors.body = body;
            }, "colors.body")
          }
        />
      </div>
      <div className="block my-[10px] mx-[0]">
        <span className="block mb-[5px] text-hedge text-[13px]">
          Цвет надписи
        </span>
        <Swatches
          value={colors.relief}
          options={INKS}
          onChange={(relief) =>
            useEditor.getState().update((draft) => {
              draft.colors.relief = relief;
            }, "colors.relief")
          }
        />
      </div>
      {samePlastic && (
        <p className="my-[6px] mx-[0] text-hedge text-[13px]">
          Все буквы углублены и печатаются тем же пластиком, что и плашка. Цвет
          надписи нужен только выпуклым буквам и рамке.
        </p>
      )}
    </Section>
  );
}

function LayerCard({
  layer,
  index,
  total,
}: {
  layer: TextLayer;
  index: number;
  total: number;
}) {
  const selected = useEditor((state) => state.layer === layer.id);
  const shown = useEditor((state) => activeName(state.project, state.active));
  const text = useEditor((state) => state.built?.text[index]);
  const def = fontDef(layer.font);
  const preview = {
    fontFamily: `${fontFamily(def)}, sans-serif`,
    fontWeight: def.weight,
  };
  const edit = (recipe: (draft: TextLayer) => void, control: string) =>
    editTag((tag) => {
      const target = tag.layers[index];
      if (target) recipe(target);
    }, `layer.${control}.${layer.id}`);
  const move = (direction: number) =>
    editTag((tag) => {
      const from = tag.layers.findIndex((entry) => entry.id === layer.id);
      const to = from + direction;
      const target = tag.layers[to];
      if (from < 0 || !target) return;
      tag.layers[to] = tag.layers[from] ?? target;
      tag.layers[from] = target;
    }, "layer.order");
  const sample = layer.text.split(NAME_TOKEN).join(shown);
  return (
    <article
      className={
        selected
          ? "border border-solid border-linen rounded-[12px] [background:#f5f1e8] selected"
          : "border border-solid border-linen rounded-[12px] [background:#f5f1e8]"
      }
    >
      <div className="flex items-center gap-[4px] p-[4px]">
        <button
          type="button"
          className="flex flex-[1] items-center gap-[10px] min-w-0 min-h-[44px] py-[4px] px-[8px] border-0 [background:none] text-left"
          aria-expanded={selected}
          onClick={() =>
            useEditor.getState().selectLayer(selected ? null : layer.id)
          }
        >
          <span className="grid shrink-0 place-items-center w-[22px] h-[22px] rounded-full [background:#23483e] text-[#fff] text-[12px] font-bold">
            {index + 1}
          </span>
          <span
            className="flex-[1] min-w-0 overflow-hidden text-[16px] text-ellipsis whitespace-nowrap"
            style={preview}
          >
            {sample || "Пустая надпись"}
          </span>
          {text && text.lines > 0 && (
            <span className="shrink-0 text-hedge text-[12px] tabular-nums">
              {text.fontSize.toLocaleString("ru-RU", {
                maximumFractionDigits: 1,
              })}{" "}
              мм
              {text.lines > 1 ? ` · ${text.lines} стр.` : ""}
            </span>
          )}
        </button>
        <div className="flex shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px] [&_button]:grid [&_button]:place-items-center [&_button]:w-[32px] [&_button]:h-[32px] [&_button]:border-0 [&_button]:rounded-[8px] [&_button]:[background:none] [&_button]:text-hedge [&_button:hover:not(:disabled)]:[background:#23483e14] [&_button:hover:not(:disabled)]:text-ink">
          <button
            type="button"
            aria-label="Сдвинуть выше"
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            <ArrowUp />
          </button>
          <button
            type="button"
            aria-label="Сдвинуть ниже"
            disabled={index === total - 1}
            onClick={() => move(1)}
          >
            <ArrowDown />
          </button>
          <button
            type="button"
            aria-label="Удалить надпись"
            onClick={() =>
              editTag((tag) => {
                tag.layers = tag.layers.filter(
                  (entry) => entry.id !== layer.id,
                );
              }, "layer.delete")
            }
          >
            <Trash2 />
          </button>
        </div>
      </div>
      {selected && (
        <div className="pt-[4px] pr-[12px] pb-[12px] pl-[12px] border-top-[1px] border-top-[#e6e2da]">
          <label className="block my-[10px] mx-[0]">
            <span className="block mb-[5px] text-hedge text-[13px]">Текст</span>
            <input
              type="text"
              maxLength={80}
              value={layer.text}
              placeholder="Название сорта"
              onChange={(event) =>
                edit((draft) => {
                  draft.text = event.target.value;
                }, "text")
              }
            />
          </label>
          <p className="my-[6px] mx-[0] text-hedge text-[13px]">
            <code>{NAME_TOKEN}</code> превращается в строку из списка: по одной
            бирке на каждое название.
            {!layer.text.includes(NAME_TOKEN) && (
              <>
                {" "}
                <button
                  type="button"
                  className="inline-flex items-center gap-[4px] p-0 border-0 [background:none] text-forest font-semibold underline [text-underline-offset:3px] [&_svg]:w-[16px] [&_svg]:h-[16px]"
                  onClick={() =>
                    edit((draft) => {
                      draft.text = `${draft.text} ${NAME_TOKEN}`.trim();
                    }, "text")
                  }
                >
                  Добавить {NAME_TOKEN}
                </button>
              </>
            )}
          </p>

          <label className="block my-[10px] mx-[0]">
            <span className="block mb-[5px] text-hedge text-[13px]">Шрифт</span>
            <select
              className="brk-select"
              value={layer.font}
              style={preview}
              onChange={(event) =>
                edit((draft) => {
                  draft.font = event.target.value;
                }, "font")
              }
            >
              {fontGroups.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {fonts
                    .filter((font) => font.group === group.id)
                    .map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.family} · {font.weightLabel}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>

          <Segmented
            label="Размер букв"
            value={layer.size > 0 ? "fixed" : "auto"}
            options={[
              { id: "auto", label: "Автоматически" },
              { id: "fixed", label: "Точный" },
            ]}
            onChange={(mode) =>
              edit((draft) => {
                draft.size = mode === "auto" ? 0 : 6;
              }, "size")
            }
          />
          {layer.size > 0 && (
            <NumberField
              label="Кегль"
              value={layer.size}
              min={1.5}
              max={40}
              step={0.5}
              onChange={(size) =>
                edit((draft) => {
                  draft.size = size;
                }, "size")
              }
            />
          )}

          <Segmented
            label="Место на плашке"
            value={layer.anchor}
            options={SLOTS}
            onChange={(anchor) =>
              edit((draft) => {
                draft.anchor = anchor;
              }, "anchor")
            }
          />
          {total > 1 && (
            <NumberField
              label="Доля высоты"
              value={layer.weight}
              min={0.5}
              max={4}
              step={0.5}
              unit="×"
              onChange={(weight) =>
                edit((draft) => {
                  draft.weight = weight;
                }, "weight")
              }
            />
          )}
          <NumberField
            label="Отступ от краёв"
            value={layer.inset}
            min={1}
            max={20}
            step={0.5}
            onChange={(inset) =>
              edit((draft) => {
                draft.inset = inset;
              }, "inset")
            }
          />
          <Segmented
            label="Выравнивание"
            value={layer.align}
            options={[
              { id: "left", label: "По левому" },
              { id: "center", label: "По центру" },
              { id: "right", label: "По правому" },
            ]}
            onChange={(align) =>
              edit((draft) => {
                draft.align = align;
              }, "align")
            }
          />
          <NumberField
            label="Сдвиг вбок"
            value={layer.offsetX}
            min={-40}
            max={40}
            step={0.5}
            onChange={(offsetX) =>
              edit((draft) => {
                draft.offsetX = offsetX;
              }, "offsetX")
            }
          />
          <NumberField
            label="Сдвиг по вертикали"
            value={layer.offsetY}
            min={-40}
            max={40}
            step={0.5}
            onChange={(offsetY) =>
              edit((draft) => {
                draft.offsetY = offsetY;
              }, "offsetY")
            }
          />
          <Segmented
            label="Рельеф"
            value={layer.relief}
            options={RELIEFS}
            onChange={(relief) =>
              edit((draft) => {
                draft.relief = relief;
              }, "relief")
            }
          />
          <details className="my-[10px] mx-[0] text-hedge [&>summary]:cursor-pointer [&>summary]:font-semibold">
            <summary>Между строками и разрядка</summary>
            <NumberField
              label="Между строками"
              value={layer.lineHeight}
              min={0.9}
              max={2}
              step={0.05}
              unit="×"
              onChange={(lineHeight) =>
                edit((draft) => {
                  draft.lineHeight = lineHeight;
                }, "lineHeight")
              }
            />
            <NumberField
              label="Разрядка букв"
              value={layer.tracking}
              min={-0.1}
              max={0.5}
              step={0.01}
              unit="em"
              onChange={(tracking) =>
                edit((draft) => {
                  draft.tracking = tracking;
                }, "tracking")
              }
            />
          </details>
          {text && (text.overflow || text.missing.length > 0) && (
            <p
              className="my-[8px] mx-[0] py-[8px] px-[10px] rounded-[8px] [background:#c4663d26]"
              role="status"
            >
              {text.overflow
                ? "Не помещается: сократите текст, уменьшите кегль или увеличьте плашку."
                : `В шрифте нет символов: ${text.missing.join(" ")}`}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function TextPanel() {
  const layers = useEditor((state) => state.project.tag.layers);
  const selected = useEditor((state) => state.layer);
  useEffect(() => {
    if (selected && !layers.some((layer) => layer.id === selected))
      useEditor.setState({ layer: null });
  }, [layers, selected]);

  const add = () => {
    const id = crypto.randomUUID();
    const slots = ["top", "middle", "bottom"] as const;
    const slot = slots[Math.min(layers.length, 2)] ?? "bottom";
    editTag((tag) => {
      tag.layers.push({
        id,
        text: NAME_TOKEN,
        font: "manrope-700",
        anchor: slot,
        weight: 1,
        align: "center",
        inset: 5,
        size: 0,
        lineHeight: 1.1,
        tracking: 0,
        offsetX: 0,
        offsetY: 0,
        relief: "raised",
      });
    }, "layer.add");
    useEditor.setState({ layer: id, tab: "text" });
  };
  const full = layers.length >= MAX_LAYERS;
  return (
    <>
      <Section
        title="Надписи"
        aside={
          <button
            type="button"
            className="inline-flex items-center gap-[4px] p-0 border-0 [background:none] text-forest font-semibold underline [text-underline-offset:3px] [&_svg]:w-[16px] [&_svg]:h-[16px]"
            onClick={add}
            disabled={full}
          >
            <Plus /> Добавить
          </button>
        }
      >
        <p className="my-[6px] mx-[0] text-hedge text-[13px]">
          Каждая надпись занимает свою полосу на плашке и сама подбирает размер,
          чтобы поместиться. Выберите надпись, чтобы настроить её.
        </p>
      </Section>
      {layers.length === 0 && (
        <button
          type="button"
          className="flex items-center justify-center gap-[8px] w-full min-h-[52px] mt-[12px] border border-dashed border-forest rounded-[12px] [background:var(--paper)] text-forest font-semibold"
          onClick={add}
        >
          <Layers /> Добавить первую надпись
        </button>
      )}
      <div className="flex flex-col gap-[8px] mt-[12px]">
        {layers.map((layer, index) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            index={index}
            total={layers.length}
          />
        ))}
      </div>
    </>
  );
}

function BatchPanel() {
  const project = useEditor((state) => state.project);
  const active = useEditor((state) => state.active);
  const size = useEditor((state) => state.built?.size) ?? { x: 60, y: 30 };
  const { names, copies, gap, margin } = project.batch;
  const list = batchNames(project);
  const plate = layoutPlate(size, list.length, gap, margin);
  const fits = list.length <= plate.capacity;
  const update = (
    recipe: (draft: typeof project.batch) => void,
    group: string,
  ) => useEditor.getState().update((draft) => recipe(draft.batch), group);
  return (
    <>
      <Section title="Список бирок">
        <label className="block my-[10px] mx-[0]">
          <span className="block mb-[5px] text-hedge text-[13px]">
            Названия сортов, по одному в строке
          </span>
          <textarea
            className="min-h-[150px] leading-[1.6] resize-y"
            rows={10}
            value={names.join("\n")}
            placeholder={"Томат Бычье сердце\nОгурец Зозуля\nПерец Сладкий"}
            onChange={(event) => {
              const lines = event.currentTarget.value.split(/\r?\n/);
              update((draft) => {
                draft.names = lines;
              }, "batch.names");
            }}
            onBlur={() => {
              const trimmed = names.map((line) => line.trimEnd());
              if (trimmed.some((line, index) => line !== names[index]))
                update((draft) => {
                  draft.names = trimmed;
                }, "batch.names");
            }}
          />
        </label>
        <p className="my-[6px] mx-[0] text-hedge text-[13px]">
          Одна строка — одна бирка. Вставьте готовый список из заметок или
          таблицы.
        </p>
        {list.length > 0 && (
          <div
            className="flex flex-wrap gap-[6px] [&>button]:max-w-[100%] [&>button]:py-[4px] [&>button]:px-[10px] [&>button]:overflow-hidden [&>button]:border [&>button]:border-solid [&>button]:border-linen [&>button]:rounded-full [&>button]:[background:var(--paper)] [&>button]:text-hedge [&>button]:text-ellipsis [&>button]:whitespace-nowrap [&>button[aria-pressed=true]]:border-forest [&>button[aria-pressed=true]]:[background:#23483e] [&>button[aria-pressed=true]]:text-[#fff]"
            role="group"
            aria-label="Какая бирка показана"
          >
            {list.map((name, index) => (
              <button
                type="button"
                key={`${name}:${index}`}
                aria-pressed={index === active}
                title={`Бирка ${index + 1}`}
                onClick={() => useEditor.getState().setActive(index)}
              >
                {copies > 1 ? `${index + 1}` : name}
              </button>
            ))}
          </div>
        )}
      </Section>
      <Section title="Раскладка на столе">
        <NumberField
          label="Экземпляров каждой"
          value={copies}
          min={1}
          max={20}
          unit="шт."
          onChange={(copies) =>
            update((draft) => {
              draft.copies = Math.trunc(copies);
            }, "batch.copies")
          }
        />
        <NumberField
          label="Зазор между бирками"
          value={gap}
          min={2}
          max={40}
          onChange={(gap) =>
            update((draft) => {
              draft.gap = gap;
            }, "batch.gap")
          }
        />
        <NumberField
          label="Отступ от края стола"
          value={margin}
          min={2}
          max={40}
          onChange={(margin) =>
            update((draft) => {
              draft.margin = margin;
            }, "batch.margin")
          }
        />
        <p
          className={
            fits
              ? "my-[8px] mx-[0] py-[8px] px-[10px] rounded-[8px] [background:#23483e0d] tabular-nums"
              : "my-[8px] mx-[0] py-[8px] px-[10px] rounded-[8px] [background:#c4663d26]"
          }
          role="status"
        >
          {fits
            ? `${list.length} ${plural(list.length, "бирка", "бирки", "бирок")} · на стол ${printer.name} помещается ${plate.capacity}`
            : `Не поместится: в партии ${list.length}, а на столе ${plate.capacity}. Уменьшите зазор или число экземпляров.`}
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-[8px] min-h-[38px] py-[8px] px-[16px] border border-solid border-linen rounded-[10px] [background:#23483e] whitespace-nowrap border-forest text-[#fff] hover:disabled:border-forest hover:disabled:[background:#15372e] [&_svg]:w-[18px] [&_svg]:h-[18px]"
          onClick={() => useEditor.getState().setView("bed")}
        >
          Показать на столе принтера
        </button>
      </Section>
    </>
  );
}

const TABS = [
  { id: "shape", label: "Бирка" },
  { id: "text", label: "Надписи" },
  { id: "batch", label: "Партия" },
] as const;

export function Inspector() {
  const tab = useEditor((state) => state.tab);
  const [focusedTab, setFocusedTab] = useState<typeof tab | null>(null);
  const warnings = useEditor((state) =>
    state.issues.some((issue) => issue.level !== "info"),
  );
  return (
    <aside
      className="flex flex-col min-h-0 border-left-[1px] border-left-[#e6e2da] [background:var(--paper)] max-[700px]:border-top-[1px] max-[700px]:border-top-[#e6e2da] max-[700px]:[border-left:0]"
      aria-label="Параметры бирки"
    >
      <div
        className="flex p-[8px] gap-[4px] border-bottom-[1px] border-bottom-[#e6e2da] [&>button]:relative [&>button]:flex-[1] [&>button]:min-h-[38px] [&>button]:border-0 [&>button]:rounded-[8px] [&>button]:[background:none] [&>button]:text-hedge [&>button]:font-semibold [&>button:hover]:text-ink [&>button[aria-selected=true]]:[background:#23483e] [&>button[aria-selected=true]]:text-[#fff]"
        role="tablist"
        aria-label="Разделы редактора"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocusedTab(null);
        }}
        onKeyDown={(event) => {
          const direction =
            event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
          if (!direction || !(event.target instanceof HTMLButtonElement))
            return;
          const tabs = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "[role=tab]",
            ),
          );
          const index = tabs.indexOf(event.target);
          if (index < 0) return;
          event.preventDefault();
          tabs[(index + direction + tabs.length) % tabs.length]?.focus();
        }}
      >
        {TABS.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            role="tab"
            aria-selected={tab === id}
            tabIndex={(focusedTab ?? tab) === id ? 0 : -1}
            onFocus={() => setFocusedTab(id)}
            onClick={() => useEditor.getState().setTab(id)}
          >
            {label}
            {id === "shape" && warnings && (
              <span
                className="absolute top-[7px] right-[10px] w-[8px] h-[8px] rounded-full [background:#a57d46]"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
      <div
        className="flex-[1] min-h-0 pt-[4px] pr-[16px] pb-[24px] pl-[16px] overflow-y-auto"
        role="tabpanel"
      >
        {tab === "shape" && <ShapePanel />}
        {tab === "text" && <TextPanel />}
        {tab === "batch" && <BatchPanel />}
      </div>
    </aside>
  );
}
