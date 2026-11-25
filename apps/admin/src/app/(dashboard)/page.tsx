import { Skeleton } from "@acme/ui";
import { Suspense } from "react";

import { OverviewCards } from "~/components/overview/overview-cards";
import { RecentOrders } from "~/components/overview/recent-orders";
import { PageHeader } from "~/components/page-header";
import { api } from "~/orpc/server";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Обзор"
        description="Сводка по клиентам и заказам магазина."
      />
      {/* The shell is prerendered; only the counters wait for the request. */}
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewWithData />
      </Suspense>
      <RecentOrders />
    </div>
  );
}

async function OverviewWithData() {
  const overview = await api.stats.overview();
  return <OverviewCards initialData={overview} />;
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {["users", "orders", "revenue", "active"].map((key) => (
        <Skeleton key={key} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
