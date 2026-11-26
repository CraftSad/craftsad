import { ArrowRight, LogIn, RotateCcw } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "~/components/3dbirka/brand";

type ErrorPageCode = "401" | "403" | "404" | "500";

const CONTENT = {
  "401": {
    eyebrow: "Требуется вход",
    title: "За этой калиткой",
    accent: "ждут ваши бирки.",
    description:
      "Войдите в личный кабинет, чтобы продолжить. Если вы только знакомитесь с мастерской, можно вернуться на главную.",
    marker: "САДОВНИК НЕ ОПОЗНАН",
    markerNote: "Нужен ключ от калитки",
  },
  "403": {
    eyebrow: "Доступ ограничен",
    title: "Эта грядка",
    accent: "для других садовников.",
    description:
      "У вашего аккаунта нет прав для просмотра этой страницы. Вернитесь на главную или выберите что-нибудь в каталоге.",
    marker: "ЗАКРЫТЫЙ УЧАСТОК",
    markerNote: "Вход по разрешению",
  },
  "404": {
    eyebrow: "Страница не найдена",
    title: "Похоже, вы свернули",
    accent: "не на ту грядку.",
    description:
      "Такой страницы больше нет — или её никогда не было. Вернёмся на главную и найдём нужную тропинку вместе.",
    marker: "УЧАСТОК НЕ НАЙДЕН",
    markerNote: "Здесь пока ничего не растёт",
  },
  "500": {
    eyebrow: "Внутренняя ошибка",
    title: "В нашем саду",
    accent: "небольшой переполох.",
    description:
      "Что-то помешало странице загрузиться. Мы уже смотрим, где сломалось. Попробуйте ещё раз или вернитесь на главную.",
    marker: "ИДЁТ ПОЛИВ",
    markerNote: "Скоро всё снова вырастет",
  },
} as const;

interface ErrorPageProps {
  code: ErrorPageCode;
  errorId?: string;
  onRetry?: () => void;
  compact?: boolean;
  global?: boolean;
}

export function ErrorPage({
  code,
  errorId,
  onRetry,
  compact = false,
  global = false,
}: ErrorPageProps) {
  const content = CONTENT[code];
  const HomeLink = global ? "a" : Link;

  return (
    <div
      className={`birka-error-page${compact ? " birka-error-page-compact" : ""}`}
    >
      <header className="birka-error-header">
        <HomeLink
          href="/"
          className="birka-error-brand"
          aria-label="3D Бирка — на главную"
        >
          <span className="birka-error-brand-mark">
            <BrandMark />
          </span>
          <span className="birka-error-wordmark">
            <span>
              3D <em>Бирка</em>
            </span>
            <small>Сад начинается с имени</small>
          </span>
        </HomeLink>
        <span className="birka-error-header-note">
          <i /> Мастерская садовых бирок
        </span>
      </header>

      <main className="birka-error-main" aria-labelledby="error-page-title">
        <section className="birka-error-copy">
          <p className="birka-error-eyebrow">
            <span className="birka-error-status-dot" />
            Ошибка {code}
            <span className="birka-error-eyebrow-line" />
            {content.eyebrow}
          </p>
          <h1 id="error-page-title">
            {content.title}
            <br />
            <em>{content.accent}</em>
          </h1>
          <p className="birka-error-description">{content.description}</p>

          {errorId && (
            <p className="birka-error-id">
              Код ошибки: <code>{errorId}</code>
            </p>
          )}

          <div className="birka-error-actions">
            {code === "500" ? (
              <>
                <button
                  type="button"
                  className="birka-error-button birka-error-button-primary"
                  onClick={onRetry}
                >
                  <RotateCcw aria-hidden="true" />
                  Попробовать ещё раз
                </button>
                <HomeLink href="/" className="birka-error-button-secondary">
                  На главную
                  <ArrowRight aria-hidden="true" />
                </HomeLink>
              </>
            ) : code === "401" ? (
              <>
                <Link
                  href="/auth/login"
                  className="birka-error-button birka-error-button-primary"
                >
                  <LogIn aria-hidden="true" />
                  Войти в аккаунт
                </Link>
                <HomeLink href="/" className="birka-error-button-secondary">
                  На главную
                  <ArrowRight aria-hidden="true" />
                </HomeLink>
              </>
            ) : (
              <>
                <HomeLink
                  href="/"
                  className="birka-error-button birka-error-button-primary"
                >
                  Вернуться на главную
                  <ArrowRight aria-hidden="true" />
                </HomeLink>
                <Link href="/#catalog" className="birka-error-button-secondary">
                  Перейти в каталог
                </Link>
              </>
            )}
          </div>
        </section>

        <ErrorIllustration code={code} />
      </main>

      <footer className="birka-error-footer">
        <span>Сад начинается с имени.</span>
        <span>
          3D БИРКА <i /> СДЕЛАНО С ЗАБОТОЙ
        </span>
      </footer>
    </div>
  );
}

function ErrorIllustration({ code }: { code: ErrorPageCode }) {
  const content = CONTENT[code];

  return (
    <div className="birka-error-visual" aria-hidden="true">
      <span className="birka-error-ghost-code">{code}</span>
      <span className="birka-error-orbit birka-error-orbit-one" />
      <span className="birka-error-orbit birka-error-orbit-two" />

      <svg
        className="birka-error-botanical"
        viewBox="0 0 440 440"
        fill="none"
        aria-hidden="true"
      >
        <g className="birka-error-branch">
          <path
            d="M74 355c42-79 66-161 149-250M122 277c-3-45 5-84 28-122M161 205c35-13 65-36 86-68M102 316c40-7 73-25 101-55"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M148 159c-30-3-48-20-53-50 30 2 49 18 53 50ZM181 199c3-33 21-53 52-61-1 32-19 53-52 61ZM122 274c-31 7-55-5-70-34 30-8 55 4 70 34ZM202 262c10-30 32-45 64-44-9 30-30 45-64 44ZM222 106c-17-25-15-49 5-72 19 24 17 48-5 72Z"
            fill="currentColor"
            opacity=".16"
          />
          <path
            d="M148 159c-17-20-32-34-53-50M181 199c20-22 36-40 52-61M122 274c-25-13-47-24-70-34M202 262c22-17 42-30 64-44M222 106c2-27 3-48 5-72"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity=".65"
          />
        </g>
      </svg>

      <div className={`birka-error-tag birka-error-tag-${code}`}>
        <span className="birka-error-tag-inner">
          <span className="birka-error-tag-hole" />
          <span className="birka-error-tag-overline">{content.marker}</span>
          <strong>{code}</strong>
          <span className="birka-error-tag-rule" />
          <small>{content.markerNote}</small>
        </span>
      </div>
      <span className="birka-error-tag-stem" />

      <div className="birka-error-ground">
        <span />
        <span />
        <span />
      </div>
      <span className="birka-error-visual-note">
        САДОВЫЙ ЖУРНАЛ <i /> ЛИСТ {code}
      </span>
    </div>
  );
}
