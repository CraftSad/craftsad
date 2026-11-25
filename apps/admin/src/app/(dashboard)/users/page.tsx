import { PageHeader } from "~/components/page-header";
import { UsersTable } from "~/components/users/users-table";

export const metadata = {
  title: "Пользователи",
};

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Пользователи"
        description="Аккаунты клиентов, их заказы и суммарные покупки."
      />
      <UsersTable />
    </div>
  );
}
