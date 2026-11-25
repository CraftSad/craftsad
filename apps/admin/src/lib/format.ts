const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
});

/** Prices are stored in kopecks. */
export function formatMoney(kopecks: number) {
  return moneyFormatter.format(kopecks / 100);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

export function formatShortDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return shortDateFormatter.format(new Date(value));
}

export function pluralOrders(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "заказ";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "заказа";
  return "заказов";
}
