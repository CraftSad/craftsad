import { Skeleton } from "@acme/ui";
import Link from "next/link";
import { Suspense } from "react";

import { OrderDetail } from "~/components/orders/order-detail";
import { PageHeader } from "~/components/page-header";

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Заказ"
        description="Детали заказа и управление статусом."
        actions={
          <Link
            href="/orders"
            className="text-muted-foreground text-sm hover:underline"
          >
            К списку
          </Link>
        }
      />
      <Suspense fallback={<DetailSkeleton />}>
        <OrderDetailFromParams params={params} />
      </Suspense>
    </div>
  );
}

async function OrderDetailFromParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
