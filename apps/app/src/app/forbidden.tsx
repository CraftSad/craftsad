import type { Metadata } from "next";
import { ErrorPage } from "~/components/errors/error-page";

export const metadata: Metadata = {
  title: "Доступ ограничен — 3D Бирка",
  description: "У вашего аккаунта нет прав для просмотра этой страницы.",
};

export default function Forbidden() {
  return <ErrorPage code="403" />;
}
