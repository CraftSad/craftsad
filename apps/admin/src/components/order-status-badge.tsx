import { Badge } from "@acme/ui/reui/badge";

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  type OrderStatus,
} from "~/lib/order-status";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={ORDER_STATUS_VARIANTS[status]} size="lg" radius="full">
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
