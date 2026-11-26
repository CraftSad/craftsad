import type { Metadata } from "next";
import { ErrorPage } from "~/components/errors/error-page";

export const metadata: Metadata = {
  title: "Страница не найдена — 3D Бирка",
  description: "Такой страницы не существует. Вернитесь на главную 3D Бирки.",
};

export default function NotFound() {
  return <ErrorPage code="404" />;
}
