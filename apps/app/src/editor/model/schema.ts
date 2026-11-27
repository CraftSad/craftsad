import { z } from "zod";

export const DEFAULT_FONT = "manrope-700";
export const MAX_LAYERS = 4;
const MAX_BATCH = 400;
/** `{name}` in a layer's text is replaced with the batch line being printed. */
export const NAME_TOKEN = "{name}";

const newId = () => crypto.randomUUID();

/** A millimetre value: out-of-range numbers are clamped instead of rejected. */
function mm(min: number, max: number, fallback: number) {
  return z
    .number()
    .catch(fallback)
    .transform((value) => Math.min(max, Math.max(min, value)));
}

const shapeSchema = z.object({
  kind: z.enum(["rounded", "ellipse", "tongue"]).catch("rounded"),
  width: mm(15, 200, 65),
  height: mm(10, 120, 27),
  radius: mm(0, 60, 3),
});

const mountSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({
    type: z.literal("stake"),
    length: mm(20, 260, 70),
    width: mm(3, 20, 8),
    tipLength: mm(4, 30, 12),
    side: z.enum(["center", "left", "right"]).catch("center"),
  }),
  z.object({
    type: z.literal("hole"),
    diameter: mm(1.5, 20, 4),
    margin: mm(2, 40, 6),
  }),
  z.object({
    type: z.literal("screws"),
    diameter: mm(1.5, 10, 3.5),
    margin: mm(3, 60, 6),
  }),
]);

const textLayerSchema = z.object({
  id: z.string().min(1).catch(newId),
  text: z.string().trim().max(80).catch(""),
  font: z.string().catch(DEFAULT_FONT),
  /** Vertical slot on the plate; slots share the height by `weight`. */
  anchor: z.enum(["top", "middle", "bottom"]).catch("middle"),
  weight: mm(0.5, 4, 1),
  align: z.enum(["left", "center", "right"]).catch("center"),
  /** Distance from the plate edge to the text zone. */
  inset: mm(1, 20, 5),
  /** Font size; 0 fits the text to its zone. */
  size: mm(0, 40, 0),
  lineHeight: mm(0.9, 2, 1.1),
  /** Extra space between letters, in em. */
  tracking: mm(-0.1, 0.5, 0),
  offsetX: mm(-80, 80, 0),
  offsetY: mm(-80, 80, 0),
  relief: z.enum(["raised", "engraved"]).catch("raised"),
});

// Defaults stay clear of the types inferred from the schemas below: those
// would reference themselves. Only types of other schemas are used here.
const noMount = { type: "none" } as const;
const noFrame = {
  enabled: false,
  inset: 2,
  thickness: 0.8,
  relief: "engraved",
} as const;
const blankTag: {
  shape: { kind: "rounded"; width: number; height: number; radius: number };
  thickness: number;
  reliefDepth: number;
  mount: typeof noMount;
  frame: typeof noFrame;
  layers: TextLayer[];
} = {
  shape: { kind: "rounded", width: 65, height: 27, radius: 3 },
  thickness: 2.4,
  reliefDepth: 0.6,
  mount: noMount,
  frame: noFrame,
  layers: [],
};
const milk = { body: "#f4efe4", relief: "#26302a" } as const;
const emptyBatch: {
  names: string[];
  copies: number;
  gap: number;
  margin: number;
} = {
  names: [],
  copies: 1,
  gap: 6,
  margin: 12,
};

export const tagSchema = z.object({
  shape: shapeSchema.default(blankTag.shape),
  /** Plate thickness. */
  thickness: mm(0.6, 8, 2.4),
  /** Height of raised lettering and depth of engraved one. */
  reliefDepth: mm(0.2, 3, 0.6),
  mount: mountSchema.catch(noMount),
  frame: z
    .object({
      enabled: z.boolean().catch(false),
      inset: mm(0.5, 15, 2),
      thickness: mm(0.4, 4, 0.8),
      relief: z.enum(["raised", "engraved"]).catch("engraved"),
    })
    .default(noFrame),
  // Overlong lists are trimmed rather than discarded whole.
  layers: z
    .array(textLayerSchema)
    .catch([])
    .transform((layers) => layers.slice(0, MAX_LAYERS)),
});

const colorsSchema = z.object({
  body: z
    .string()
    .regex(/^#[\da-f]{6}$/i)
    .catch(milk.body),
  relief: z
    .string()
    .regex(/^#[\da-f]{6}$/i)
    .catch(milk.relief),
});

/** Handoffs must keep the entire list, with no repair or trimming. */
export const handoffNamesSchema = z
  .array(z.string().refine((name) => name.trim().length <= 80))
  .max(MAX_BATCH);

const batchSchema = z.object({
  names: z
    .array(z.string().trim().max(80))
    .catch([])
    .transform((names) => names.slice(0, MAX_BATCH)),
  /** Copies printed of every batch line. */
  copies: mm(1, 20, 1).transform(Math.trunc),
  gap: mm(2, 40, 6),
  margin: mm(2, 40, 12),
});

export const projectSchema = z.object({
  version: z.literal(1),
  title: z.string().trim().max(60).catch("Моя бирка"),
  printer: z.literal("qidi-plus5").catch("qidi-plus5"),
  /** Template the project started from, if it was made from one. */
  template: z.string().trim().max(40).optional().catch(undefined),
  tag: tagSchema.default(blankTag),
  colors: colorsSchema.default(milk),
  batch: batchSchema.default(emptyBatch),
});

export type Shape = z.infer<typeof shapeSchema>;
export type Mount = z.infer<typeof mountSchema>;
export type TextLayer = z.infer<typeof textLayerSchema>;
type Frame = z.infer<typeof tagSchema>["frame"];
export type TagDesign = z.infer<typeof tagSchema>;
type Colors = z.infer<typeof colorsSchema>;
type Batch = z.infer<typeof batchSchema>;
export type Project = z.infer<typeof projectSchema>;
/** A union member with every detail optional except its discriminator. */
type PartialByType<T, K extends string> = T extends { type: K }
  ? Partial<T> & { type: K }
  : never;

/** A project with any part left out; the schema fills in the rest. */
export type ProjectDraft = {
  title?: string;
  template?: string;
  colors?: Partial<Colors>;
  batch?: Partial<Batch>;
  tag?: {
    shape?: Partial<Shape>;
    mount?: PartialByType<Mount, Mount["type"]>;
    thickness?: number;
    reliefDepth?: number;
    frame?: Partial<Frame> & Pick<Frame, "enabled">;
    layers?: (Partial<Omit<TextLayer, "id">> & Pick<TextLayer, "text">)[];
  };
};

export function createLayer(text = NAME_TOKEN): TextLayer {
  return textLayerSchema.parse({ text });
}

export function createProject(): Project {
  return projectSchema.parse({
    version: 1,
    title: "Новая бирка",
    tag: { layers: [{ text: NAME_TOKEN }] },
    batch: { names: ["Томат Бычье сердце", "Огурец Зозуля", "Перец Сладкий"] },
  });
}

/** Replaces `{name}` with the batch line; other text stays as typed. */
export function resolveText(text: string, name: string) {
  return text.split(NAME_TOKEN).join(name);
}
