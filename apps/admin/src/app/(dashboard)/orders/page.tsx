import { OrdersTable } from "~/components/orders/orders-table";
import { PageHeader } from "~/components/page-header";

export const metadata = {
  title: "Заказы",
};

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Заказы"
        description="Все заказы магазина: поиск, фильтр по статусу и управление."
      />
      <OrdersTable />
    </div>
  );
}
