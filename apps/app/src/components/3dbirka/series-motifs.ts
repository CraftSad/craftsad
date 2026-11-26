export type SeriesId = "classic" | "slate" | "kids" | "provence";

type ClassicShapeId = "stake" | "flag" | "hanging";
type SlateShapeId = "slate-contour" | "slate-cloud" | "slate-tall";
type KidsShapeId = "kids-auto" | "kids-hedgehog" | "kids-sunflower";
type ProvenceShapeId =
  | "provence-auto"
  | "provence-cartouche"
  | "provence-watering";

export type ShapeId =
  | ClassicShapeId
  | SlateShapeId
  | KidsShapeId
  | ProvenceShapeId;

export type PlantMotif =
  | "tomato"
  | "cucumber"
  | "pepper"
  | "eggplant"
  | "zucchini"
  | "basil"
  | "dill"
  | "parsley"
  | "strawberry"
  | "carrot"
  | "lettuce"
  | "sunflower"
  | "pea"
  | "pumpkin"
  | "hedgehog"
  | "rosemary"
  | "lavender"
  | "thyme"
  | "mint"
  | "oregano"
  | "marjoram";

type SlateSilhouette =
  | "crown-oval"
  | "tilted-oval"
  | "scallop-bell"
  | "leaf-point"
  | "carrot-heart"
  | "cloud";

type KidsCharacter =
  | "carrot"
  | "strawberry"
  | "sunflower"
  | "tomato"
  | "cucumber"
  | "pea"
  | "pumpkin"
  | "hedgehog";

type ProvencePlaque =
  | "arch-crest"
  | "oval"
  | "baroque"
  | "dome"
  | "heart"
  | "watering-can";

export type SeriesPalette = {
  name: string;
  label: string;
  base: string;
  ink: string;
  accent: string;
  hint: string;
  autoMulti?: boolean;
};

export type ResolvedTagVisual = {
  series: SeriesId;
  shape: ShapeId;
  motif: PlantMotif;
  slateSilhouette: SlateSilhouette;
  kidsCharacter: KidsCharacter;
  provencePlaque: ProvencePlaque;
  base: string;
  ink: string;
  accent: string;
  secondary: string;
  detail: string;
  tallStake: boolean;
  uppercase: boolean;
};

const MOTIF_PATTERNS: [RegExp, PlantMotif][] = [
  [
    /томат|помидор|черри|бычье|де\s*барао|санька|любаш|кумир|малиновк|розовый\s*м[её]д/iu,
    "tomato",
  ],
  [/огур|зозул|герман|корнишон|апрельск/iu, "cucumber"],
  [/перец|перц|калифорн|огон[её]к|халапень|паприк|чили/iu, "pepper"],
  [/баклажан|алмаз|синеньк/iu, "eggplant"],
  [/кабач|цуккин|патиссон|искандер/iu, "zucchini"],
  [/базилик|геновез|рейхан/iu, "basil"],
  [/укроп|аллигатор|фенхел/iu, "dill"],
  [/петрушк|сельдер|кинз|кориандр|богатыр/iu, "parsley"],
  [/клубник|земляник|елизавет|руян|виктори|малин|ежевик/iu, "strawberry"],
  [
    /морков|нантск|св[её]кл|бордо|редис|сор[аы]|редьк|реп[аы]|пастернак/iu,
    "carrot",
  ],
  [
    /салат|лолло|капуст|слав[аы]|руккол|покер|шпинат|матадор|щавел|мангольд/iu,
    "lettuce",
  ],
  [
    /подсолн|георгин|астр|ромашк|бархатц|петуни|пион|роз[аы]|лили|ирис|флокс|цвет|кукуруз/iu,
    "sunflower",
  ],
  [/горох|альф[аы]|фасол|сакс|боб[ыо]/iu, "pea"],
  [/тыкв|баттернат|арбуз|дын[яи]|колхозниц/iu, "pumpkin"],
  [/розмарин|тархун|эстрагон|шалфей/iu, "rosemary"],
  [/лаванд|иссоп|котовник/iu, "lavender"],
  [/чабрец/iu, "marjoram"],
  [/тимьян/iu, "thyme"],
  [/мят[аы]|мелисс|перечн/iu, "mint"],
  [/душиц/iu, "marjoram"],
  [/орегано|майоран/iu, "oregano"],
];

export function detectPlantMotif(name: string, fallbackIndex = 0): PlantMotif {
  const clean = name.trim();
  for (const [pattern, motif] of MOTIF_PATTERNS) {
    if (pattern.test(clean)) return motif;
  }
  const cycle: PlantMotif[] = [
    "basil",
    "tomato",
    "strawberry",
    "carrot",
    "lavender",
    "cucumber",
  ];
  return cycle[Math.abs(fallbackIndex) % cycle.length] ?? "basil";
}

export function shapeToSeries(shape: ShapeId): SeriesId {
  if (shape.startsWith("slate-")) return "slate";
  if (shape.startsWith("kids-")) return "kids";
  if (shape.startsWith("provence-")) return "provence";
  return "classic";
}

function resolveSlateSilhouette(
  shape: ShapeId,
  motif: PlantMotif,
): SlateSilhouette {
  if (shape === "slate-cloud") return "cloud";
  switch (motif) {
    case "tomato":
    case "strawberry":
      return "crown-oval";
    case "cucumber":
    case "eggplant":
    case "zucchini":
    case "pea":
      return "tilted-oval";
    case "basil":
    case "mint":
    case "rosemary":
      return "leaf-point";
    case "carrot":
      return "carrot-heart";
    default:
      return "scallop-bell";
  }
}

function resolveKidsCharacter(
  shape: ShapeId,
  motif: PlantMotif,
  name: string,
): KidsCharacter {
  if (shape === "kids-hedgehog") return "hedgehog";
  if (shape === "kids-sunflower") return "sunflower";
  switch (motif) {
    case "carrot":
      return "carrot";
    case "strawberry":
      return "strawberry";
    case "sunflower":
    case "lavender":
      return "sunflower";
    case "tomato":
    case "pepper":
      return "tomato";
    case "cucumber":
      return "cucumber";
    case "pea":
      return "pea";
    case "pumpkin":
      return "pumpkin";
    case "zucchini":
      return "hedgehog";
    default:
      return /[её]ж/iu.test(name) ? "hedgehog" : "hedgehog";
  }
}

function resolveProvencePlaque(
  shape: ShapeId,
  motif: PlantMotif,
  name: string,
  index: number,
): ProvencePlaque {
  if (shape === "provence-cartouche") return "baroque";
  if (shape === "provence-watering") return "watering-can";
  if (/душиц/iu.test(name)) return "watering-can";
  if (/чабрец/iu.test(name)) return "baroque";
  switch (motif) {
    case "basil":
      return "arch-crest";
    case "rosemary":
    case "cucumber":
      return "oval";
    case "lavender":
    case "oregano":
      return "baroque";
    case "thyme":
    case "dill":
    case "parsley":
      return "dome";
    case "mint":
    case "strawberry":
      return "heart";
    case "marjoram":
    case "sunflower":
      return "watering-can";
    default: {
      const order: ProvencePlaque[] = [
        "arch-crest",
        "oval",
        "baroque",
        "dome",
        "heart",
        "watering-can",
      ];
      return order[Math.abs(index) % order.length] ?? "baroque";
    }
  }
}

const KIDS_CHARACTER_COLORS: Record<
  KidsCharacter,
  {
    base: string;
    ink: string;
    accent: string;
    secondary: string;
    detail: string;
  }
> = {
  carrot: {
    base: "#eb7c28",
    ink: "#fff6e7",
    accent: "#7aa854",
    secondary: "#f6ead6",
    detail: "#c95e14",
  },
  strawberry: {
    base: "#d84a3d",
    ink: "#fff6e9",
    accent: "#79a753",
    secondary: "#fff9f0",
    detail: "#f2c64b",
  },
  sunflower: {
    base: "#f2bf3b",
    ink: "#553927",
    accent: "#81ab61",
    secondary: "#f8d362",
    detail: "#5e402c",
  },
  tomato: {
    base: "#df533c",
    ink: "#fff6e8",
    accent: "#78a651",
    secondary: "#f6e7d4",
    detail: "#b93824",
  },
  cucumber: {
    base: "#638754",
    ink: "#f7f1e3",
    accent: "#f2c141",
    secondary: "#8ab070",
    detail: "#49693d",
  },
  pea: {
    base: "#7aa360",
    ink: "#fff7ea",
    accent: "#a5c884",
    secondary: "#fff5e5",
    detail: "#588043",
  },
  pumpkin: {
    base: "#ea8b27",
    ink: "#fff6e6",
    accent: "#75a153",
    secondary: "#f7ebd8",
    detail: "#c46c14",
  },
  hedgehog: {
    base: "#ebd2b5",
    ink: "#4b3324",
    accent: "#6e4b36",
    secondary: "#f6e7d3",
    detail: "#2d1e15",
  },
};

const PROVENCE_MIX_COLORS: {
  match?: RegExp;
  base: string;
  ink: string;
  accent: string;
}[] = [
  { match: /базилик/iu, base: "#efe5d4", ink: "#61574c", accent: "#818d70" },
  { match: /розмарин/iu, base: "#8d987e", ink: "#f2eadb", accent: "#6d785f" },
  { match: /лаванд/iu, base: "#efe5d4", ink: "#61574c", accent: "#8d7998" },
  { match: /тимьян/iu, base: "#b96845", ink: "#f3e6d3", accent: "#dfbe9f" },
  { match: /мят/iu, base: "#96a088", ink: "#f4ecde", accent: "#788467" },
  { match: /чабрец/iu, base: "#9d899c", ink: "#f4eee7", accent: "#7a667d" },
  { match: /душиц/iu, base: "#efe4d2", ink: "#62574b", accent: "#8a7f72" },
  { match: /орегано/iu, base: "#8e9980", ink: "#f3ecdd", accent: "#cbbd82" },
];

export function resolveTagVisual({
  shape,
  color,
  name,
  index = 0,
  palettes,
}: {
  shape: ShapeId;
  color: number;
  name: string;
  index?: number;
  palettes: readonly SeriesPalette[];
}): ResolvedTagVisual {
  const series = shapeToSeries(shape);
  const motif = detectPlantMotif(name, index);
  const slateSilhouette = resolveSlateSilhouette(shape, motif);
  const kidsCharacter = resolveKidsCharacter(shape, motif, name);
  const provencePlaque = resolveProvencePlaque(shape, motif, name, index);
  const palette = palettes[color] ??
    palettes[0] ?? {
      name: "Молочная",
      label: "Чёрные буквы",
      base: "#f4efe4",
      ink: "#26302a",
      accent: "#7a8c74",
      hint: "",
    };

  if (series === "kids" && palette.autoMulti) {
    const charColors = KIDS_CHARACTER_COLORS[kidsCharacter];
    return {
      series,
      shape,
      motif,
      slateSilhouette,
      kidsCharacter,
      provencePlaque,
      base: charColors.base,
      ink: charColors.ink,
      accent: charColors.accent,
      secondary: charColors.secondary,
      detail: charColors.detail,
      tallStake: shape === "kids-sunflower",
      uppercase: true,
    };
  }

  if (series === "provence" && palette.autoMulti) {
    const matched = PROVENCE_MIX_COLORS.find((entry) =>
      entry.match?.test(name),
    ) ??
      PROVENCE_MIX_COLORS[Math.abs(index) % PROVENCE_MIX_COLORS.length] ?? {
        base: "#efe5d4",
        ink: "#61574c",
        accent: "#818d70",
      };
    return {
      series,
      shape,
      motif,
      slateSilhouette,
      kidsCharacter,
      provencePlaque,
      base: matched.base,
      ink: matched.ink,
      accent: matched.accent,
      secondary: "#f7f1e6",
      detail: matched.accent,
      tallStake: false,
      uppercase: true,
    };
  }

  return {
    series,
    shape,
    motif,
    slateSilhouette,
    kidsCharacter,
    provencePlaque,
    base: palette.base,
    ink: palette.ink,
    accent: palette.accent,
    secondary: series === "slate" ? palette.ink : "#f8f1e4",
    detail: palette.accent,
    tallStake: shape === "flag" || shape === "slate-tall",
    uppercase: series === "kids" || series === "provence",
  };
}
