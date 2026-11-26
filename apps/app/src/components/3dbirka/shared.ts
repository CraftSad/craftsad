import { z } from "zod";
import type { ShapeId } from "./data";
import type { TagConfig } from "./tag-config";

export type Category =
  | "all"
  | "collections"
  | "seedling"
  | "garden"
  | "greenhouse"
  | "large";
export type View = "front" | "side" | "rotate";

export type CartItem = TagConfig & {
  id: number;
  price: number;
  itemShapes?: ShapeId[];
  originalPrice?: number;
};

export const money = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value);

const localPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && /^[78]/.test(digits)
    ? digits.slice(1)
    : digits;
};

export const formatPhone = (value: string) => {
  const local = localPhone(value);
  return `+7 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 8)}-${local.slice(8)}`;
};

export const phoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^\+?[\d ().-]+$/.test(value) && localPhone(value).length === 10,
    "Введите номер телефона полностью",
  );

export const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 65,
      damping: 20,
      staggerChildren: 0.1,
    },
  },
};
