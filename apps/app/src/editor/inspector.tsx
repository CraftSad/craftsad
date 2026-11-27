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
            className="brk-link"
            onClick={() => useEditor.getState().setDialog("templates")}
          >
            Сменить
          </button>
        }
      >
        <p className="brk-note">
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
        <p className="brk-note">
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
      <div className="brk-field">
        <span className="brk-field-label">Пластик плашки</span>
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
      <div className="brk-field">
        <span className="brk-field-label">Цвет надписи</span>
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
        <p className="brk-note">
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
    fontFamily: `${fontFamily(def.id)}, sans-serif`,
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
    <article className={selected ? "brk-layer selected" : "brk-layer"}>
      <div className="brk-layer-row">
        <button
          type="button"
          className="brk-layer-head"
          aria-expanded={selected}
          onClick={() =>
            useEditor.getState().selectLayer(selected ? null : layer.id)
          }
        >
          <span className="brk-layer-badge">{index + 1}</span>
          <span className="brk-layer-sample" style={preview}>
            {sample || "Пустая надпись"}
          </span>
          {text && text.lines > 0 && (
            <span className="brk-layer-meta">
              {text.fontSize.toLocaleString("ru-RU", {
                maximumFractionDigits: 1,
              })}{" "}
              мм
              {text.lines > 1 ? ` · ${text.lines} стр.` : ""}
            </span>
          )}
        </button>
        <div className="brk-layer-actions">
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
        <div className="brk-layer-body">
          <label className="brk-field">
            <span className="brk-field-label">Текст</span>
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
          <p className="brk-note">
            <code>{NAME_TOKEN}</code> превращается в строку из списка: по одной
            бирке на каждое название.
            {!layer.text.includes(NAME_TOKEN) && (
              <>
                {" "}
                <button
                  type="button"
                  className="brk-link"
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

          <label className="brk-field">
            <span className="brk-field-label">Шрифт</span>
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
          <details className="brk-more">
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
            <p className="brk-warning" role="status">
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
            className="brk-link"
            onClick={add}
            disabled={full}
          >
            <Plus /> Добавить
          </button>
        }
      >
        <p className="brk-note">
          Каждая надпись занимает свою полосу на плашке и сама подбирает размер,
          чтобы поместиться. Выберите надпись, чтобы настроить её.
        </p>
      </Section>
      {layers.length === 0 && (
        <button type="button" className="brk-empty" onClick={add}>
          <Layers /> Добавить первую надпись
        </button>
      )}
      <div className="brk-layers">
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
  const joined = names.join("\n");
  const [text, setText] = useState(joined);
  // Follow undo and project loads, but not the line being typed.
  useEffect(() => {
    if (text.split(/\r?\n/).join("\n") !== joined) setText(joined);
  }, [joined, text]);
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
        <label className="brk-field">
          <span className="brk-field-label">
            Названия сортов, по одному в строке
          </span>
          <textarea
            className="brk-textarea"
            rows={10}
            value={text}
            placeholder={"Томат Бычье сердце\nОгурец Зозуля\nПерец Сладкий"}
            onChange={(event) => {
              setText(event.target.value);
              const names = event.target.value
                .split(/\r?\n/)
                .map((line) => line.trimEnd());
              update((draft) => {
                draft.names = names;
              }, "batch.names");
            }}
          />
        </label>
        <p className="brk-note">
          Одна строка — одна бирка. Вставьте готовый список из заметок или
          таблицы.
        </p>
        {list.length > 0 && (
          <div
            className="brk-chips"
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
              draft.copies = copies;
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
        <p className={fits ? "brk-summary" : "brk-warning"} role="status">
          {fits
            ? `${list.length} ${plural(list.length, "бирка", "бирки", "бирок")} · на стол ${printer.name} помещается ${plate.capacity}`
            : `Не поместится: в партии ${list.length}, а на столе ${plate.capacity}. Уменьшите зазор или число экземпляров.`}
        </p>
        <button
          type="button"
          className="brk-button"
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
  const warnings = useEditor((state) =>
    state.issues.some((issue) => issue.level !== "info"),
  );
  return (
    <aside className="brk-inspector" aria-label="Параметры бирки">
      <div className="brk-tabs" role="tablist" aria-label="Разделы редактора">
        {TABS.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => useEditor.getState().setTab(id)}
          >
            {label}
            {id === "shape" && warnings && (
              <span className="brk-tab-dot" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
      <div className="brk-inspector-body" role="tabpanel">
        {tab === "shape" && <ShapePanel />}
        {tab === "text" && <TextPanel />}
        {tab === "batch" && <BatchPanel />}
      </div>
    </aside>
  );
}
