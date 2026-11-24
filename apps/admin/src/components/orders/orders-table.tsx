"use client";

import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui";
import { Alert, AlertDescription, AlertTitle } from "@acme/ui/reui/alert";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { OrderStatusBadge } from "~/components/order-status-badge";
import { Pagination } from "~/components/pagination";
import { formatDate, formatMoney } from "~/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "~/lib/order-status";
import { orpc } from "~/orpc/react";

const LIMIT = 20;

type StatusFilter = (typeof ORDER_STATUSES)[number] | "all";

export function OrdersTable() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, isFetching } = useQuery(
    orpc.orders.list.queryOptions({
      input: {
        limit: LIMIT,
        offset,
        status,
        query: query || undefined,
      },
      placeholderData: keepPreviousData,
    }),
  );

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-0">
        <form
          className="flex flex-wrap items-center gap-2 px-4"
          onSubmit={(event) => {
            event.preventDefault();
            setOffset(0);
            setQuery(input.trim());
          }}
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Номер заказа, имя, телефон или почта"
            className="max-w-sm"
            aria-label="Поиск заказов"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              if (!value) return;
              setStatus(value);
              setOffset(0);
            }}
          >
            <SelectTrigger className="w-52" aria-label="Фильтр по статусу">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {ORDER_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {ORDER_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" variant="outline">
            Найти
          </Button>
          {query || status !== "all" ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setInput("");
                setQuery("");
                setStatus("all");
                setOffset(0);
              }}
            >
              Сбросить
            </Button>
          ) : null}
          {isFetching && !isLoading ? (
            <span className="text-muted-foreground text-xs">Обновление…</span>
          ) : null}
        </form>

        {isError ? (
          <div className="px-4">
            <Alert variant="destructive">
              <AlertTitle>Не удалось загрузить заказы</AlertTitle>
              <AlertDescription>
                Проверьте подключение к базе данных и обновите страницу.
              </AlertDescription>
            </Alert>
          </div>
        ) : isLoading || !data ? (
          <div className="space-y-2 px-4">
            {["a", "b", "c", "d", "e"].map((key) => (
              <Skeleton key={key} className="h-11 w-full" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <p className="text-muted-foreground px-4 py-10 text-center text-sm">
            Заказы не найдены.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Заказ</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Аккаунт</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Позиции</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead className="pr-4">Создан</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="pl-4 font-medium">
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
                          {order.customerPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/users/${order.user.id}`}
                          className="hover:underline"
                        >
                          {order.user.name}
                        </Link>
                        <span className="text-muted-foreground text-xs">
                          {order.user.email}
                        </span>
                      </div>
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
                    <TableCell className="text-muted-foreground pr-4 text-sm">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              offset={offset}
              limit={LIMIT}
              total={data.total}
              onChange={setOffset}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
