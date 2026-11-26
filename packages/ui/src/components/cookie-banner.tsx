"use client";

import { CookieIcon } from "lucide-react";
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

export function CookieBanner({
  href = "/legal/privacy",
  className,
}: CookieBannerProps) {
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
    <aside
      aria-label="Уведомление об использовании cookie"
      className={cn(
        "animate-in fade-in slide-in-from-bottom-5 duration-300 fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl sm:inset-x-6 sm:bottom-5",
        className,
      )}
    >
      <div className="border-border/80 bg-card/95 text-card-foreground flex flex-col gap-4 rounded-2xl border p-4 shadow-xl ring-1 ring-black/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5 sm:py-4 dark:ring-white/10">
        <div className="flex items-start gap-3.5 sm:items-center">
          <div
            aria-hidden="true"
            className="bg-primary/10 text-primary border-primary/15 flex size-10 shrink-0 items-center justify-center rounded-xl border"
          >
            <CookieIcon className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-foreground text-sm leading-none font-semibold">
              Мы используем файлы cookie
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-[13px]">
              Они помогают сайту работать стабильно и становиться удобнее.{" "}
              <a
                href={href}
                className="text-foreground hover:text-primary font-medium underline decoration-current/40 underline-offset-4 transition-colors"
              >
                Подробнее
              </a>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={decline}
            className="flex-1 rounded-xl sm:flex-initial"
          >
            Отказаться
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="flex-1 rounded-xl px-4 sm:flex-initial"
          >
            Принять
          </Button>
        </div>
      </div>
    </aside>
  );
}
