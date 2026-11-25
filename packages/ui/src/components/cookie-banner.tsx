"use client";

import * as React from "react";

import { Button } from "./button";
import { cn } from ".";

const COOKIE_CONSENT_KEY = "badge3d:cookie-consent";

type Consent = "accepted" | "declined";

type CookieBannerProps = {
  /** Ссылка на страницу с подробностями (по умолчанию политика конфиденциальности) */
  href?: string;
  className?: string;
};

export function CookieBanner({ href = "/legal/privacy", className }: CookieBannerProps) {
  const [mounted, setMounted] = React.useState(false);
  const [consent, setConsent] = React.useState<Consent | null>(null);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored === "accepted" || stored === "declined") {
        setConsent(stored);
      }
    } catch {
      // localStorage недоступен (например, приватный режим)
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
      // игнорируем ошибку записи
    }
    setConsent("accepted");
  };

  const decline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    } catch {
      // игнорируем ошибку записи
    }
    setConsent("declined");
  };

  // Не рендерим на сервере и не показываем повторно после выбора пользователя
  if (!mounted || consent !== null) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[50] flex flex-col items-center justify-center gap-4 p-6 border-t border-border bg-background/90 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-4",
      className,
    )}>
      <p className="max-w-2xl text-center sm:text-left leading-relaxed">
        Мы используем cookie, чтобы сайт работал и становился удобнее.{" "}
        Продолжая пользоваться сайтом, вы соглашаетесь с этим.{" "}
        <a
          href={href}
          className="underline underline-offset-4 decoration-primary decoration-2 hover:underline-offset-2 hover:text-primary"
        >
          Подробнее
        </a>
      </p>
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
        <Button variant="outline" size="sm" onClick={decline}>
          отказаться
        </Button>
        <Button size="sm" onClick={accept}>
          хорошо
        </Button>
      </div>
    </div>
  );
}
