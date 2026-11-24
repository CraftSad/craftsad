"use client";

import {
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
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { OrderStatusBadge } from "~/components/order-status-badge";
import { formatDate, formatMoney } from "~/lib/format";
import { orpc } from "~/orpc/react";

export function RecentOrders() {
  const { data, isLoading } = useQuery(
    orpc.orders.list.queryOptions({
      input: { limit: 6, offset: 0, status: "all" },
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние заказы</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading || !data ? (
          <div className="space-y-2 px-6">
            {["a", "b", "c"].map((key) => (
              <Skeleton key={key} className="h-10 w-full" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <p className="text-muted-foreground px-6 py-8 text-sm">
            Заказов пока нет.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Заказ</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead className="pr-6">Создан</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((order) => (
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
                    <div className="flex flex-col">
                      <span>{order.customerName}</span>
                      <span className="text-muted-foreground text-xs">
                        {order.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatMoney(order.totalAmount)}
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
  );
}
