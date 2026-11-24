"use client";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui";
import { Alert, AlertDescription, AlertTitle } from "@acme/ui/reui/alert";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { OrderStatusBadge } from "~/components/order-status-badge";
import { formatDate, formatMoney, pluralOrders } from "~/lib/format";
import { orpc } from "~/orpc/react";

export function UserDetail({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery(
    orpc.users.byId.queryOptions({ input: { id } }),
  );

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Пользователь не найден</AlertTitle>
        <AlertDescription>
          {error.message || "Возможно, аккаунт был удалён."}{" "}
          <Link href="/users" className="underline">
            Вернуться к списку
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const { user, orders, stats } = data;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            {user.name}
            {user.role
              .split(",")
              .map((role) => role.trim())
              .filter(Boolean)
              .map((role) => (
                <Badge
                  key={role}
                  variant={role === "admin" ? "default" : "outline"}
                >
                  {role === "admin" ? "Админ" : role}
                </Badge>
              ))}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-muted-foreground">Электронная почта</div>
            <div className="font-medium break-all">{user.email}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Телефон</div>
            <div className="font-medium">{user.phoneNumber ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Регистрация</div>
            <div className="font-medium">{formatDate(user.createdAt)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">ID</div>
            <div className="font-mono text-xs break-all">{user.id}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Заказы
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {stats.orderCount}
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              {pluralOrders(stats.orderCount)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Потрачено
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {formatMoney(stats.totalSpent)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заказы пользователя</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {orders.length === 0 ? (
            <p className="text-muted-foreground px-6 py-8 text-sm">
              У пользователя пока нет заказов.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Заказ</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Позиции</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Город</TableHead>
                  <TableHead className="pr-6">Создан</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="pl-6 font-medium">
                      <Link
                        href={`/orders/${order.id}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {order.itemCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {order.ozonCity}
                    </TableCell>
                    <TableCell className="text-muted-foreground pr-6 text-sm">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
