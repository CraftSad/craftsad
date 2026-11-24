"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui";
import { Alert, AlertDescription, AlertTitle } from "@acme/ui/reui/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { OrderStatusBadge } from "~/components/order-status-badge";
import { formatDate, formatMoney } from "~/lib/format";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  type OrderStatus,
} from "~/lib/order-status";
import { orpc } from "~/orpc/react";

export function OrderDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery(
    orpc.orders.byId.queryOptions({ input: { id } }),
  );

  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [tracking, setTracking] = useState("");

  const update = useMutation(
    orpc.orders.updateStatus.mutationOptions({
      onSuccess: (updated) => {
        if (updated) {
          setStatus(updated.status);
          setTracking(updated.ozonTrackingNumber ?? "");
        }
        toast.success("Статус заказа обновлён");
        void queryClient.invalidateQueries({
          queryKey: orpc.orders.byId.queryKey({ input: { id } }),
        });
        void queryClient.invalidateQueries({
          queryKey: orpc.orders.list.queryKey({ input: {} }),
        });
        void queryClient.invalidateQueries({
          queryKey: orpc.stats.overview.queryKey({}),
        });
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || "Не удалось обновить заказ");
      },
    }),
  );

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Заказ не найден</AlertTitle>
        <AlertDescription>
          {error.message || "Возможно, заказ был удалён."}{" "}
          <Link href="/orders" className="underline">
            Вернуться к списку
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const currentStatus = status ?? data.status;
  const orderId = data.id;
  const currentTracking = tracking || (data.ozonTrackingNumber ?? "");
  const statusChanged = currentStatus !== data.status;
  const trackingChanged =
    currentStatus === "shipped_ozon" &&
    currentTracking.trim() !== (data.ozonTrackingNumber ?? "");

  function handleSave() {
    if (!currentStatus) return;
    if (currentStatus === "shipped_ozon" && !currentTracking.trim()) {
      toast.error("Укажите трек-номер Ozon");
      return;
    }
    update.mutate({
      id: orderId,
      status: currentStatus,
      ...(currentTracking.trim()
        ? { ozonTrackingNumber: currentTracking.trim() }
        : {}),
    });
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex flex-wrap items-center gap-2">
              Заказ {data.orderNumber}
              <OrderStatusBadge status={data.status} />
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Создан {formatDate(data.createdAt)} ·{" "}
              {formatMoney(data.totalAmount)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/users/${data.user.id}`} />}
          >
            Профиль клиента
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-muted-foreground">Получатель</div>
            <div className="font-medium">{data.customerName}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Телефон</div>
            <div className="font-medium">{data.customerPhone}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Город</div>
            <div className="font-medium">{data.ozonCity}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Пункт выдачи</div>
            <div className="font-medium">{data.ozonPvzAddress}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Управление статусом</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="order-status">Статус</Label>
              <Select
                value={currentStatus}
                onValueChange={(value) => {
                  if (value) setStatus(value);
                }}
              >
                <SelectTrigger id="order-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {ORDER_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order-tracking">Трек-номер Ozon</Label>
              <Input
                id="order-tracking"
                value={currentTracking}
                onChange={(event) => setTracking(event.target.value)}
                placeholder="Например, 1234567890"
                disabled={currentStatus !== "shipped_ozon"}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={
                update.isPending || (!statusChanged && !trackingChanged)
              }
            >
              {update.isPending ? "Сохранение…" : "Сохранить"}
            </Button>
            {(statusChanged || trackingChanged) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStatus(null);
                  setTracking("");
                }}
              >
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Позиции заказа</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Товар</TableHead>
                <TableHead>Настройка</TableHead>
                <TableHead className="text-right">Кол-во</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="pr-6 text-right">Итого</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6 font-medium">
                    {item.product.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.customizationJson
                      ? `${item.customizationJson.lengthMm}×${item.customizationJson.heightMm} мм · ${item.customizationJson.varieties.join(", ")}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(item.unitPrice)}
                  </TableCell>
                  <TableCell className="pr-6 text-right tabular-nums">
                    {formatMoney(item.unitPrice * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data.printJob ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Задание на печать
              <Badge variant="outline">{data.printJob.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <div className="text-muted-foreground">Попытки</div>
              <div className="font-medium tabular-nums">
                {data.printJob.attempts}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Архив STL</div>
              <div className="font-medium break-all">
                {data.printJob.stlArchiveUrl ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Ошибка</div>
              <div className="font-medium break-all">
                {data.printJob.errorLog ?? "—"}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Separator />
      <p className="text-muted-foreground text-xs">
        Клиент уведомляется по SMS и почте при изменении статуса или
        трек-номера.
      </p>
    </div>
  );
}
