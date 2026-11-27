import { colorPairs } from "~/components/3dbirka/data";
import { type Project, type ProjectDraft, projectSchema } from "./schema";

export type Template = {
  id: string;
  title: string;
  hint: string;
  project: Project;
};

/** Same body/lettering pairs as the storefront. */
const pair = (index: number) => ({
  body: colorPairs[index]?.base ?? "#f4efe4",
  relief: colorPairs[index]?.ink ?? "#26302a",
});

type Draft = ProjectDraft;

/** A complete project that remembers which template it started from. */
function template(
  id: string,
  title: string,
  hint: string,
  draft: Draft,
): Template {
  return {
    id,
    title,
    hint,
    project: projectSchema.parse({ ...draft, version: 1, title, template: id }),
  };
}

export const defaultTemplate = template(
  "stake",
  "Колышек для рассады",
  "В стаканчик, кашпо или кассету",
  {
    tag: {
      shape: { width: 65, height: 27, radius: 3 },
      mount: { type: "stake", length: 70, width: 8, tipLength: 12 },
      layers: [{ text: "{name}" }],
    },
    colors: pair(0),
    batch: {
      names: ["Томат Бычье сердце", "Огурец Зозуля", "Перец Сладкий"],
    },
  },
);

/**
 * Starting points, one per kind of garden tag. Each is a complete project:
 * open it, edit the text or size, export.
 */
export const templates: Template[] = [
  defaultTemplate,
  template("flag", "Флажок на грядку", "Видно издалека над всходами", {
    tag: {
      shape: { width: 80, height: 40, radius: 4 },
      mount: {
        type: "stake",
        length: 110,
        width: 8,
        tipLength: 14,
        side: "left",
      },
      frame: { enabled: true, inset: 2, thickness: 0.8, relief: "engraved" },
      layers: [
        { text: "{name}", anchor: "top", weight: 2 },
        { text: "Сорт для теплицы", anchor: "bottom", size: 4 },
      ],
    },
    colors: pair(4),
    batch: {
      names: ["Морковь Нантская", "Свёкла Бордо", "Редис Сора"],
    },
  }),
  template("hanging", "Подвесная на ветку", "На шпалеру или ветку с хомутом", {
    tag: {
      shape: { width: 70, height: 26, radius: 13 },
      mount: { type: "hole", diameter: 4, margin: 5.5 },
      layers: [{ text: "{name}", font: "rubik-700" }],
    },
    colors: pair(2),
    batch: {
      names: ["Томат Де Барао", "Огурец Герман", "Перец Огонёк"],
    },
  }),
  template("medal", "Медальон с датой", "Название сорта и год посева", {
    tag: {
      shape: { kind: "tongue", width: 56, height: 72 },
      mount: { type: "hole", diameter: 4, margin: 6 },
      layers: [
        { text: "{name}", font: "unbounded-700", anchor: "top", weight: 2 },
        { text: "2026", font: "caveat-700", anchor: "bottom", size: 6 },
      ],
    },
    colors: pair(1),
    batch: {
      names: ["Базилик Геновезе", "Мята Перечная", "Руккола Покер"],
    },
  }),
  template("round", "Круглый бейдж", "На горшок или контейнер", {
    tag: {
      shape: { kind: "ellipse", width: 60, height: 60, radius: 0 },
      mount: { type: "none" },
      frame: { enabled: true, inset: 2.5, thickness: 1, relief: "raised" },
      layers: [{ text: "{name}", font: "manrope-800", inset: 4 }],
    },
    colors: pair(3),
    batch: {
      names: ["Петуния", "Лаванда", "Пион", "Роза"],
    },
  }),
  template("sign", "Табличка на саморезы", "На бортик грядки или ящик", {
    tag: {
      shape: { width: 100, height: 28, radius: 2 },
      thickness: 3,
      mount: { type: "screws", diameter: 3.5, margin: 7 },
      frame: { enabled: true, inset: 1.5, thickness: 0.8, relief: "engraved" },
      layers: [
        {
          text: "{name}",
          font: "pt-sans-narrow-700",
          relief: "engraved",
        },
      ],
    },
    colors: pair(5),
    batch: {
      names: ["ГРЯДКА 1 · Морковь", "ГРЯДКА 2 · Свёкла", "ГРЯДКА 3 · Лук"],
    },
  }),
];

/** The template a project names, or undefined for a project without one. */
export function findTemplate(id: string | null | undefined) {
  return templates.find((entry) => entry.id === id);
}
