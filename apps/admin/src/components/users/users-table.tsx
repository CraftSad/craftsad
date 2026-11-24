"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
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

import { Pagination } from "~/components/pagination";
import { formatMoney, formatShortDate, pluralOrders } from "~/lib/format";
import { orpc } from "~/orpc/react";

const LIMIT = 20;

export function UsersTable() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, isFetching } = useQuery(
    orpc.users.list.queryOptions({
      input: { limit: LIMIT, offset, query: query || undefined },
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
            placeholder="Имя, почта или телефон"
            className="max-w-sm"
            aria-label="Поиск пользователей"
          />
          <Button type="submit" variant="outline">
            Найти
          </Button>
          {query ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setInput("");
                setQuery("");
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
              <AlertTitle>Не удалось загрузить пользователей</AlertTitle>
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
            Пользователи не найдены.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Пользователь</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead className="text-right">Заказы</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Последний заказ</TableHead>
                  <TableHead className="pr-4">Регистрация</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/users/${user.id}`}
                          className="font-medium hover:underline"
                        >
                          {user.name}
                        </Link>
                        <span className="text-muted-foreground text-xs">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.phoneNumber ?? "—"}
                    </TableCell>
                    <TableCell>
                      {user.role
                        .split(",")
                        .map((role) => role.trim())
                        .filter(Boolean)
                        .map((role) => (
                          <Badge
                            key={role}
                            variant={role === "admin" ? "default" : "outline"}
                            className="mr-1"
                          >
                            {role === "admin" ? "Админ" : role}
                          </Badge>
                        ))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {user.orderCount}
                      <span className="text-muted-foreground ml-1 text-xs">
                        {pluralOrders(user.orderCount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(user.totalSpent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.lastOrderAt
                        ? formatShortDate(user.lastOrderAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground pr-4 text-sm">
                      {formatShortDate(user.createdAt)}
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
