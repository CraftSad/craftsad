"use client";

import type { RouterOutputs } from "@acme/admin-api";
import { Skeleton } from "@acme/ui";
import { Alert, AlertDescription, AlertTitle } from "@acme/ui/reui/alert";
import {
  Frame,
  FrameDescription,
  FramePanel,
  FrameTitle,
} from "@acme/ui/reui/frame";
import { useQuery } from "@tanstack/react-query";
import { PackageCheck, ShoppingBag, Users, Wallet } from "lucide-react";

import { formatMoney } from "~/lib/format";
import { orpc } from "~/orpc/react";

export function OverviewCards({
  initialData,
}: {
  initialData?: RouterOutputs["stats"]["overview"];
}) {
  const { data, isLoading, isError } = useQuery(
    orpc.stats.overview.queryOptions({ initialData }),
  );

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Не удалось загрузить сводку</AlertTitle>
        <AlertDescription>
          Обновите страницу или проверьте подключение к базе данных.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {["users", "orders", "revenue", "active"].map((key) => (
          <Skeleton key={key} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Пользователи",
      value: data.users.toLocaleString("ru-RU"),
      hint: "Всего аккаунтов",
      icon: Users,
    },
    {
      title: "Заказы",
      value: data.orders.toLocaleString("ru-RU"),
      hint: "За всё время",
      icon: ShoppingBag,
    },
    {
      title: "Выручка",
      value: formatMoney(data.revenue),
      hint: "Без отменённых заказов",
      icon: Wallet,
    },
    {
      title: "В работе",
      value: data.activeOrders.toLocaleString("ru-RU"),
      hint: "Не завершены и не отменены",
      icon: PackageCheck,
    },
  ];

  return (
    <Frame
      variant="ghost"
      spacing="sm"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <FramePanel key={stat.title} fit className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <FrameTitle className="text-muted-foreground text-sm font-medium">
              {stat.title}
            </FrameTitle>
            <stat.icon className="text-muted-foreground size-4" />
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {stat.value}
          </div>
          <FrameDescription>{stat.hint}</FrameDescription>
        </FramePanel>
      ))}
    </Frame>
  );
}
