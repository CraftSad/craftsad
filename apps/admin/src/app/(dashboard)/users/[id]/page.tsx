import { Skeleton } from "@acme/ui";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "~/components/page-header";
import { UserDetail } from "~/components/users/user-detail";

export default function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Пользователь"
        description="Профиль клиента и история его заказов."
        actions={
          <Link
            href="/users"
            className="text-muted-foreground text-sm hover:underline"
          >
            К списку
          </Link>
        }
      />
      {/* `params` is request-time data: read it behind a boundary so the
          shell still prerenders. */}
      <Suspense fallback={<DetailSkeleton />}>
        <UserDetailFromParams params={params} />
      </Suspense>
    </div>
  );
}

async function UserDetailFromParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetail id={id} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
