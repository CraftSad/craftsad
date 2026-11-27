import type { BuiltTag } from "./geometry";
import { mountCenters, plateClearance, platePoints } from "./outline";
import { printer } from "./printer";
import { resolveText, type TagDesign } from "./schema";
import { MIN_FONT_SIZE } from "./text";

export type Issue = {
  level: "error" | "warning" | "info";
  message: string;
};

const round = (value: number) => Math.round(value * 10) / 10;
const mm = (value: number) => `${round(value)} мм`;

/**
 * Printability rules for the QIDI Plus 5 (0.4 mm nozzle, 0.2 mm layers).
 * Errors make a print impossible, warnings make it fragile or unreadable.
 */
export function checkTag(tag: TagDesign, built: BuiltTag | null): Issue[] {
  const issues: Issue[] = [];
  const add = (level: Issue["level"], message: string) =>
    issues.push({ level, message });
  const { shape, mount, thickness, reliefDepth, frame } = tag;
  const walls = 2 * printer.wall;

  if (!built) {
    add("error", "Модель не построилась — измените параметры");
    return issues;
  }
  if (
    built.size.x > printer.bed.x ||
    built.size.y > printer.bed.y ||
    built.size.z > printer.bed.z
  )
    add(
      "error",
      `Бирка ${mm(built.size.x)} × ${mm(built.size.y)} мм не помещается на стол ${printer.bed.x} × ${printer.bed.y} мм`,
    );

  if (thickness < 0.8)
    add("warning", `Плашка тоньше 0,8 мм (${mm(thickness)}) — может сломаться`);
  const engraved =
    tag.layers.some((layer) => layer.relief === "engraved") ||
    (frame.enabled && frame.relief === "engraved");
  if (reliefDepth < printer.layerHeight * 2 && tag.layers.length)
    add(
      "warning",
      `Рельеф ${mm(reliefDepth)} — меньше двух слоёв, буквы сольются`,
    );
  if (engraved && reliefDepth >= thickness)
    add("error", "Гравировка сквозная: глубина больше толщины плашки");
  else if (engraved && thickness - reliefDepth < 0.8)
    add(
      "warning",
      `Под гравировкой остаётся ${mm(thickness - reliefDepth)} — дно может продавиться`,
    );

  if (mount.type === "hole" || mount.type === "screws") {
    const points = platePoints(shape);
    const distance = Math.min(
      ...mountCenters(shape, mount).map((center) =>
        plateClearance(points, center),
      ),
    );
    const radius = mount.diameter / 2;
    const wall = distance - radius;
    if (mount.diameter < 2)
      add(
        "warning",
        `Отверстие ${mm(mount.diameter)} уже 2 мм — может зарасти`,
      );
    if (distance <= -radius) add("warning", "Отверстие не пересекает плашку");
    else if (wall < 0) add("warning", "Отверстие выходит за край плашки");
    else if (wall < walls)
      add("warning", `Стенка у отверстия ${mm(wall)} — тоньше двух периметров`);
  }
  if (mount.type === "stake") {
    if (mount.width < 4)
      add(
        "warning",
        `Колышек уже 4 мм (${mm(mount.width)}) — согнётся в земле`,
      );
    if (mount.tipLength < 5)
      add("warning", "Слишком короткое остриё — колышек трудно воткнуть");
  }
  if (shape.kind === "tongue" && shape.height < shape.width / 2)
    add(
      "info",
      "Арка не может быть выше половины ширины: язычок уже, чем задано",
    );
  if (shape.radius > Math.min(shape.width, shape.height) / 2)
    add("info", "Радиус ограничен половиной меньшей стороны");

  if (!tag.layers.length) add("info", "На бирке нет надписи");
  tag.layers.forEach((layer, index) => {
    const label = `Надпись «${resolveText(layer.text, "…")}»`;
    const text = built.text[index];
    if (!text?.lines) {
      if (layer.text.trim()) add("warning", `${label} не помещается на плашке`);
      return;
    }
    if (text.missing.length)
      add(
        "warning",
        `${label}: в шрифте нет символов ${text.missing.join(" ")}`,
      );
    if (text.overflow)
      add(
        "warning",
        `${label} не помещается — сократите текст или увеличьте плашку`,
      );
    else if (text.fontSize < 3)
      add(
        "warning",
        `${label}: буквы ${mm(text.fontSize)} — тоньше сопла 0,4 мм, будут плохо читаться`,
      );
    else if (text.fontSize < MIN_FONT_SIZE + 1)
      add(
        "info",
        `${label}: буквы ${mm(text.fontSize)} — мелко, но печатается`,
      );
  });
  return issues;
}
