"use client";

import { RuntimeErrorPage } from "~/components/errors/runtime-error-page";
import "~/app/error-pages.css";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="ru">
      <body className="birka-error-document">
        <title>Что-то пошло не так — 3D Бирка</title>
        <RuntimeErrorPage error={error} retry={retry} />
      </body>
    </html>
  );
}
