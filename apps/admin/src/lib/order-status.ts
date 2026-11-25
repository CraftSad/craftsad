import { ORDER_STATUSES } from "@acme/admin-api/constants";
import type { Badge } from "@acme/ui/reui/badge";
import type { ComponentProps } from "react";

export { ORDER_STATUSES };

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Ожидает оплаты",
  paid: "Оплачен",
  generating_stl: "Готовится STL",
  printing: "Печатается",
  shipped_ozon: "Передан в Ozon",
  ready_for_pickup: "Готов к выдаче",
  completed: "Завершён",
  cancelled: "Отменён",
};

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

export const ORDER_STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  pending_payment: "warning-light",
  paid: "success-light",
  generating_stl: "info-light",
  printing: "info",
  shipped_ozon: "primary-light",
  ready_for_pickup: "focus-light",
  completed: "success",
  cancelled: "destructive-light",
};
