import {
  type ResolvedTagVisual,
  resolveTagVisual,
  type SeriesId,
  type SeriesPalette,
  type ShapeId,
  shapeToSeries,
} from "./series-motifs";

export type { SeriesId, SeriesPalette, ShapeId };
export { shapeToSeries };

export type ShapeEntry = {
  id: ShapeId;
  series: SeriesId;
  title: string;
  size: string;
  heightCm: number;
  widthCm: number;
  price: number;
  detail: string;
  field: string;
};

export const tagSeries = [
  {
    id: "classic" as const,
    title: "Классика",
    fullTitle: "Классическая серия",
    subtitle: "Лаконичные бирки",
    badge: "Базовая",
    tagline: "Минималистичная форма и крупный шрифт",
    description:
      "Чистая геометрия без лишних деталей — идеально для рассады, сортовых коллекций и теплицы.",
    coverImage: null,
    coverCaption: "",
    defaultShape: "stake" as ShapeId,
    varieties: [
      "Томат Бычье сердце",
      "Огурец Зозуля",
      "Перец Калифорнийское чудо",
      "Клубника Елизавета",
    ],
  },
  {
    id: "slate" as const,
    title: "Грифельная",
    fullTitle: "Грифельная коллекция",
    subtitle: "Скетч и светлый кант",
    badge: "Новинка",
    tagline: "Стильно. Практично. С любовью к саду",
    description:
      "Фигурные тёмные таблички под натуральный сланец с тонким кантом и ботанической гравировкой.",
    coverImage: "/images/collections/slate-collection.jpg",
    coverCaption: "Грифельная коллекция — фигурные таблички в высокой грядке",
    defaultShape: "slate-contour" as ShapeId,
    varieties: ["Томаты", "Огурцы", "Перец", "Базилик", "Клубника", "Морковь"],
  },
  {
    id: "kids" as const,
    title: "Детская",
    fullTitle: "Детская серия",
    subtitle: "Овощи и лесные герои",
    badge: "Для детей",
    tagline: "Весело сажать — интересно растить!",
    description:
      "Яркие объёмные фигурки морковки, клубники, подсолнуха и лесного ёжика для совместных посадок с детьми.",
    coverImage: "/images/collections/kids-series.jpg",
    coverCaption: "Детская серия — многоцветные фигурки овощей и ёжика",
    defaultShape: "kids-auto" as ShapeId,
    varieties: [
      "Морковь",
      "Клубника",
      "Подсолнух",
      "Помидор",
      "Горох",
      "Кабачок",
    ],
  },
  {
    id: "provence" as const,
    title: "Прованс",
    fullTitle: "Коллекция Прованс",
    subtitle: "Резной картуш и травы",
    badge: "Премиум",
    tagline: "Красивый огород начинается с мелочей",
    description:
      "Французские фигурные таблички, сердечки и лейки в приглушённых оттенках с рельефными веточками трав.",
    coverImage: "/images/collections/provence-collection.jpg",
    coverCaption: "Коллекция Прованс — резные таблички для пряных трав",
    defaultShape: "provence-auto" as ShapeId,
    varieties: ["Базилик", "Розмарин", "Лаванда", "Тимьян", "Мята", "Душица"],
  },
] as const;

const shapes: readonly ShapeEntry[] = [
  {
    id: "stake",
    series: "classic",
    title: "Колышек",
    size: "10 см",
    heightCm: 10,
    widthCm: 6.5,
    price: 60,
    detail: "Для стаканчиков, кассет и горшков",
    field: "Поле текста: 6,5 см · до 2 строк",
  },
  {
    id: "flag",
    series: "classic",
    title: "Флажок",
    size: "18 см",
    heightCm: 18,
    widthCm: 8,
    price: 90,
    detail: "Для открытых грядок и высоких кустов",
    field: "Поле текста: 8 см · читается стоя",
  },
  {
    id: "hanging",
    series: "classic",
    title: "Подвесная",
    size: "8 см",
    heightCm: 8,
    widthCm: 8,
    price: 70,
    detail: "На ветку или шпалеру в теплице + хомут",
    field: "Отверстие 4 мм · не теряется в листве",
  },
];

export const allShapes: readonly ShapeEntry[] = [
  ...shapes,
  {
    id: "slate-contour",
    series: "slate",
    title: "Фигурный контур",
    size: "12 см",
    heightCm: 12,
    widthCm: 7.5,
    price: 120,
    detail: "Силуэт и ботанический скетч подстраиваются под культуру",
    field: "Рельефный рисунок + кант · до 2 строк",
  },
  {
    id: "slate-cloud",
    series: "slate",
    title: "Резное облачко",
    size: "12 см",
    heightCm: 12,
    widthCm: 7.5,
    price: 120,
    detail: "Единая ажурная табличка с иллюстрацией растения",
    field: "Поле текста: 7 см · единый ритм грядки",
  },
  {
    id: "slate-tall",
    series: "slate",
    title: "Высокий грифель",
    size: "18 см",
    heightCm: 18,
    widthCm: 8.5,
    price: 145,
    detail: "Удлинённая ножка для пышных кустов и открытых грядок",
    field: "Высота 18 см · не прячется в ботве",
  },
  {
    id: "kids-auto",
    series: "kids",
    title: "Герои грядки",
    size: "13 см",
    heightCm: 13,
    widthCm: 8,
    price: 145,
    detail: "Морковка, клубника, горошек, тыква и ёжик — под каждый сорт",
    field: "Многоцветный 3D-рельеф · до 2 строк",
  },
  {
    id: "kids-hedgehog",
    series: "kids",
    title: "Лесной ёжик",
    size: "13 см",
    heightCm: 13,
    widthCm: 8.5,
    price: 150,
    detail: "Добрый ёжик с табличкой в лапках для любого растения",
    field: "Широкая табличка · любимец детей",
  },
  {
    id: "kids-sunflower",
    series: "kids",
    title: "Подсолнух",
    size: "15 см",
    heightCm: 15,
    widthCm: 8.5,
    price: 150,
    detail: "Солнечный цветок на зелёном стебле с листочками",
    field: "Лента по центру цветка · 15 см",
  },
  {
    id: "provence-auto",
    series: "provence",
    title: "Ассорти Прованс",
    size: "12,5 см",
    heightCm: 12.5,
    widthCm: 8,
    price: 135,
    detail: "Арка, овал, картуш, сердечко и лейка — под пряные травы",
    field: "Рельефная веточка + рамка · до 2 строк",
  },
  {
    id: "provence-cartouche",
    series: "provence",
    title: "Резной картуш",
    size: "12,5 см",
    heightCm: 12.5,
    widthCm: 8,
    price: 135,
    detail: "Французская табличка с фигурным краем в едином стиле",
    field: "Веточка трав сверху · благородный рельеф",
  },
  {
    id: "provence-watering",
    series: "provence",
    title: "Садовая лейка",
    size: "13 см",
    heightCm: 13,
    widthCm: 8.5,
    price: 145,
    detail: "Фигурная лейка с пышным букетом цветов и сердечком",
    field: "Уютный акцент для кашпо и подарка",
  },
];

export const colorPairs = [
  { name: "Молочная", label: "Чёрные буквы", base: "#f4efe4", ink: "#26302a" },
  { name: "Хвойная", label: "Белые буквы", base: "#28513e", ink: "#ffffff" },
  { name: "Терракота", label: "Белые буквы", base: "#ae6849", ink: "#ffffff" },
  { name: "Графит", label: "Золотые буквы", base: "#343935", ink: "#e9c981" },
  { name: "Солнечная", label: "Чёрные буквы", base: "#e6c963", ink: "#25302b" },
  {
    name: "Песочная",
    label: "Коричневые буквы",
    base: "#ddc6a4",
    ink: "#563d2d",
  },
] as const;

const colorHints = [
  "Максимальный контраст, читается в сумерках",
  "Сливается с зеленью, не пестрит на клумбе",
  "Под цвет глиняных горшков и тёплых грядок",
  "Эффектный акцент для коллекционных сортов",
  "Сразу заметна в густой траве",
  "Спокойный природный оттенок",
];

const seriesPalettesMap: Record<SeriesId, readonly SeriesPalette[]> = {
  classic: colorPairs.map((pair, index) => ({
    name: pair.name,
    label: pair.label,
    base: pair.base,
    ink: pair.ink,
    accent: pair.ink,
    hint: colorHints[index] ?? "",
  })),
  slate: [
    {
      name: "Грифель и мел",
      label: "Светлый скетч",
      base: "#1f2221",
      ink: "#f2ead9",
      accent: "#cbb799",
      hint: "Тёмный матовый сланец со светлым рисунком и тёплым кантом",
    },
    {
      name: "Грифель и дуб",
      label: "Крафтовый кант",
      base: "#24211e",
      ink: "#f5eddd",
      accent: "#b99066",
      hint: "Тёплый древесный контур под деревянные грядки и кашпо",
    },
    {
      name: "Грифель и шалфей",
      label: "Мятный скетч",
      base: "#1c2521",
      ink: "#eaf1e7",
      accent: "#93ad96",
      hint: "Мягкий ботанический оттенок среди густой зелени",
    },
  ],
  kids: [
    {
      name: "Палитра героев",
      label: "Яркие фигурки",
      base: "#eb7c28",
      ink: "#fff6e7",
      accent: "#7aa854",
      autoMulti: true,
      hint: "Каждая культура в своих натуральных красках, как на витрине",
    },
    {
      name: "Солнечная грядка",
      label: "Сливочные буквы",
      base: "#ee8f29",
      ink: "#fff7e8",
      accent: "#78a652",
      hint: "Тёплый абрикосово-зелёный дуэт для всей детской клумбы",
    },
    {
      name: "Ягодная полянка",
      label: "Белые буквы",
      base: "#d84e40",
      ink: "#fff7eb",
      accent: "#79a854",
      hint: "Сочный ягодный цвет, который дети находят с первого взгляда",
    },
    {
      name: "Лесной ёжик",
      label: "Шоколадные буквы",
      base: "#ebd2b5",
      ink: "#4a3222",
      accent: "#6e4b36",
      hint: "Уютные пастельные тона в стиле тёплой деревянной игрушки",
    },
  ],
  provence: [
    {
      name: "Прованс Микс",
      label: "5 оттенков трав",
      base: "#efe5d4",
      ink: "#61574c",
      accent: "#8d987e",
      autoMulti: true,
      hint: "Сливочный лён, шалфей, лаванда и терракота в одном наборе",
    },
    {
      name: "Сливочный лён",
      label: "Ореховые буквы",
      base: "#efe5d4",
      ink: "#5f554a",
      accent: "#889477",
      hint: "Нежная французская классика с оливковой веточкой",
    },
    {
      name: "Шалфей",
      label: "Светлые буквы",
      base: "#8d987e",
      ink: "#f4ecdd",
      accent: "#b9c2a2",
      hint: "Благородный приглушённо-зелёный тон для пряного сада",
    },
    {
      name: "Лавандовый туман",
      label: "Кремовые буквы",
      base: "#9d899c",
      ink: "#f5efe8",
      accent: "#79637e",
      hint: "Пудровый сиреневый акцент для ароматных трав и цветов",
    },
    {
      name: "Терракота Прованса",
      label: "Молочные буквы",
      base: "#b86845",
      ink: "#f4e7d4",
      accent: "#dfbe9d",
      hint: "Тёплый оттенок южной керамики и старой черепицы",
    },
  ],
};

const defaultShapeEntry: ShapeEntry = {
  id: "stake",
  series: "classic",
  title: "Колышек",
  size: "10 см",
  heightCm: 10,
  widthCm: 6.5,
  price: 60,
  detail: "Для стаканчиков, кассет и горшков",
  field: "Поле текста: 6,5 см · до 2 строк",
};

const defaultPalette: SeriesPalette = {
  name: "Молочная",
  label: "Чёрные буквы",
  base: "#f4efe4",
  ink: "#26302a",
  accent: "#26302a",
  hint: "Максимальный контраст, читается в сумерках",
};

export function getShapesForSeries(series: SeriesId): readonly ShapeEntry[] {
  return allShapes.filter((entry) => entry.series === series);
}

export function getShapeEntry(shape: ShapeId): ShapeEntry {
  return allShapes.find((entry) => entry.id === shape) ?? defaultShapeEntry;
}

export function getSeriesPalettes(series: SeriesId): readonly SeriesPalette[] {
  return seriesPalettesMap[series];
}

export function getPaletteForShape(
  shape: ShapeId,
  colorIndex: number,
): SeriesPalette {
  const palettes = seriesPalettesMap[shapeToSeries(shape)];
  return palettes[colorIndex] ?? palettes[0] ?? defaultPalette;
}

export function getTagVisual(
  shape: ShapeId,
  colorIndex: number,
  name: string,
  itemIndex = 0,
): ResolvedTagVisual {
  return resolveTagVisual({
    shape,
    color: colorIndex,
    name,
    index: itemIndex,
    palettes: seriesPalettesMap[shapeToSeries(shape)],
  });
}

const collectionPresets: PresetKit[] = [
  {
    title: "Грифельная коллекция",
    category: "collections",
    series: "slate",
    shape: "slate-contour",
    color: 0,
    badge: "Грифельная серия",
    coverImage: "/images/collections/slate-collection.jpg",
    subtitle: "Фигурные таблички со светлым ботаническим скетчем",
    items: [
      "Томаты",
      "Огурцы",
      "Перец",
      "Баклажаны",
      "Кабачки",
      "Базилик",
      "Укроп",
      "Петрушка",
      "Клубника",
      "Морковь",
      "Салат",
    ],
  },
  {
    title: "Детская серия: Весёлый огород",
    category: "collections",
    series: "kids",
    shape: "kids-auto",
    color: 0,
    badge: "Детская серия",
    coverImage: "/images/collections/kids-series.jpg",
    subtitle: "Объёмные цветные фигурки овощей, ягод и лесного ёжика",
    items: [
      "Морковь",
      "Клубника",
      "Подсолнух",
      "Помидор",
      "Огурец",
      "Горох",
      "Тыква",
      "Кабачок",
    ],
  },
  {
    title: "Прованс: Пряные травы",
    category: "collections",
    series: "provence",
    shape: "provence-auto",
    color: 0,
    badge: "Коллекция Прованс",
    coverImage: "/images/collections/provence-collection.jpg",
    subtitle: "Резные картуши, сердечко и лейка с рельефными веточками",
    items: [
      "Базилик",
      "Розмарин",
      "Лаванда",
      "Тимьян",
      "Мята",
      "Чабрец",
      "Душица",
      "Орегано",
    ],
  },
];

const standardPresets: PresetKit[] = [
  {
    title: "Первые всходы",
    category: "seedling",
    shape: "stake",
    color: 0,
    items: ["Томат", "Огурец", "Перец", "Баклажан", "Базилик", "Салат"],
  },
  {
    title: "Любимые томаты",
    category: "seedling",
    shape: "stake",
    color: 1,
    items: [
      "Бычье сердце",
      "Черри",
      "Де Барао",
      "Розовый мёд",
      "Санька",
      "Алтайский",
      "Любаша",
      "Кумир",
      "Малиновка",
    ],
  },
  {
    title: "Большая рассада",
    category: "seedling",
    shape: "stake",
    color: 4,
    items: [
      "Томат",
      "Огурец",
      "Перец",
      "Баклажан",
      "Капуста",
      "Салат",
      "Базилик",
      "Петрушка",
      "Укроп",
      "Лук",
      "Кабачок",
      "Тыква",
      "Арбуз",
      "Дыня",
      "Сельдерей",
      "Клубника",
      "Земляника",
      "Фасоль",
    ],
  },
  {
    title: "Зелень у дома",
    category: "garden",
    shape: "flag",
    color: 5,
    items: ["Петрушка", "Укроп", "Базилик", "Мята", "Руккола", "Шпинат"],
  },
  {
    title: "Урожайная грядка",
    category: "garden",
    shape: "flag",
    color: 2,
    items: [
      "Морковь",
      "Свёкла",
      "Лук",
      "Чеснок",
      "Огурцы",
      "Томаты",
      "Редис",
      "Горох",
      "Фасоль",
    ],
  },
  {
    title: "Весь огород",
    category: "garden",
    shape: "flag",
    color: 1,
    items: [
      "Морковь",
      "Свёкла",
      "Лук",
      "Чеснок",
      "Огурцы",
      "Томаты",
      "Редис",
      "Горох",
      "Фасоль",
      "Картофель",
      "Кабачок",
      "Тыква",
      "Капуста",
      "Перец",
      "Баклажан",
      "Салат",
      "Укроп",
      "Петрушка",
    ],
  },
  {
    title: "Тепличный сезон",
    category: "seedling",
    shape: "hanging",
    color: 0,
    items: [
      "Томат",
      "Огурец",
      "Перец",
      "Баклажан",
      "Базилик",
      "Салат",
      "Укроп",
      "Петрушка",
      "Клубника",
      "Мята",
      "Лук",
    ],
  },
  {
    title: "Сорта цветов",
    category: "garden",
    shape: "flag",
    color: 3,
    items: [
      "Пион",
      "Роза",
      "Лилия",
      "Ирис",
      "Астра",
      "Георгин",
      "Флокс",
      "Лаванда",
      "Ромашка",
      "Петуния",
      "Бархатцы",
    ],
  },
  {
    title: "Дачная коллекция",
    category: "garden",
    shape: "flag",
    color: 4,
    items: ["Томаты", "Огурцы", "Клубника", "Мята", "Базилик", "Цветы"],
  },
];

export type PresetKit = {
  title: string;
  category: string;
  series?: SeriesId;
  shape: ShapeId;
  color: number;
  items: string[];
  mixed?: boolean;
  badge?: string;
  coverImage?: string;
  subtitle?: string;
};
export type Preset = PresetKit;
export const presets: PresetKit[] = [
  ...collectionPresets,
  ...standardPresets,
  {
    title: "Полный сезон: от рассады до грядки",
    category: "large",
    shape: "stake",
    color: 0,
    mixed: true,
    badge: "Выгода 15%",
    items: [
      "Томат Бычье сердце",
      "Томат Черри",
      "Огурец Зозуля",
      "Огурец Герман",
      "Перец Сладкий",
      "Перец Огонёк",
      "Баклажан Алмаз",
      "Кабачок Искандер",
      "Тыква Баттернат",
      "Морковь Нантская",
      "Свёкла Бордо",
      "Редис Сора",
      "Капуста Слава",
      "Лук Эксибишен",
      "Чеснок Любаша",
      "Салат Лолло Росса",
      "Базилик Геновезе",
      "Укроп Аллигатор",
      "Петрушка Богатырь",
      "Мята Перечная",
      "Руккола Покер",
      "Шпинат Матадор",
      "Горох Альфа",
      "Фасоль Сакса",
      "Клубника Елизавета",
      "Земляника Руяна",
      "Арбуз Огонёк",
      "Дыня Колхозница",
      "Сельдерей Юта",
      "Кукуруза Лакомка",
    ],
  },
];

export const tagPhotos = colorPairs.map((pair) => ({
  color: pair.name,
  photos: ["При дневном свете", "В посадках"].map((scene) => ({
    src: "/images/tag-photo-placeholder.svg",
    alt: `Фото-заглушка: бирка ${pair.name}, ${pair.label.toLowerCase()} — ${scene.toLowerCase()}`,
    caption: scene,
    placeholder: true,
  })),
}));
