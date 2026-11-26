import type { Metadata } from "next";
import { ErrorPage } from "~/components/errors/error-page";

export const metadata: Metadata = {
  title: "Требуется вход — 3D Бирка",
  description: "Войдите в аккаунт 3D Бирки, чтобы открыть эту страницу.",
};

export default function Unauthorized() {
  return <ErrorPage code="401" />;
}
