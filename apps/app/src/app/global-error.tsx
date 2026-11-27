"use client";

import { RuntimeErrorPage } from "~/components/errors/runtime-error-page";
import "~/app/styles.css";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="ru">
      <body className="m-0 bg-milk">
        <title>Что-то пошло не так — 3D Бирка</title>
        <RuntimeErrorPage error={error} retry={retry} global />
      </body>
    </html>
  );
}
