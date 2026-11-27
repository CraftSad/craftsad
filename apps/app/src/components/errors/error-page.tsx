import { cn } from "@acme/ui";
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

const focusRing =
  "focus-visible:outline-[3px] focus-visible:outline-[#c87d55] focus-visible:outline-offset-[5px]";

const primaryButton = cn(
  "inline-flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-full border border-transparent bg-forest px-6 py-[15px]",
  "text-sm font-semibold text-[#fffdf7] no-underline shadow-[0_9px_22px_#23483e17]",
  "transition-[background-color,box-shadow,transform] duration-250 motion-reduce:transition-none",
  "hover:-translate-y-0.5 hover:bg-forest-dark hover:shadow-[0_12px_28px_#23483e26]",
  "max-[560px]:min-h-[54px] max-[560px]:w-full",
  focusRing,
);

const secondaryButton = cn(
  "relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-3 border-0 bg-transparent px-0 py-1.5",
  "text-sm font-semibold text-forest no-underline",
  "after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-[#23483e55] after:transition-transform after:duration-250 after:content-[''] motion-reduce:after:transition-none",
  "hover:after:scale-x-[0.35]",
  "max-[560px]:min-h-[42px]",
  focusRing,
);

const iconClass = "size-[17px] shrink-0";

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
      className={cn(
        "relative isolate grid min-h-svh grid-rows-[auto_1fr_auto] overflow-hidden px-[clamp(32px,4.5vw,72px)] pt-[30px] pb-6",
        "bg-milk bg-[radial-gradient(ellipse_at_83%_42%,#dce3d28c,transparent_38%),radial-gradient(ellipse_at_4%_100%,#e9dfca80,transparent_33%)]",
        "font-craft text-[16px] leading-[1.5] text-ink",
        "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:bg-grain before:opacity-[0.035] before:content-['']",
        "max-[1100px]:px-[34px]",
        "max-[820px]:px-7 max-[820px]:pt-[26px] max-[820px]:pb-[22px]",
        "max-[560px]:px-5 max-[560px]:pt-[21px] max-[560px]:pb-[18px]",
        "max-[370px]:px-4",
        compact &&
          "m-3.5 min-h-[calc(100svh-92px)] rounded-[26px] border border-[#d7d1c1] max-[820px]:m-2.5 max-[820px]:min-h-[calc(100svh-76px)] max-[560px]:rounded-[20px] max-[560px]:px-[18px]",
      )}
    >
      <header
        className={cn(
          "relative z-[1] mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6",
          compact && "hidden",
        )}
      >
        <HomeLink
          href="/"
          className={cn(
            "inline-flex items-center gap-3 text-ink no-underline max-[560px]:gap-2.5",
            focusRing,
          )}
          aria-label="3D Бирка — на главную"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-[14px_14px_14px_4px] border border-[#b5965c55] bg-[linear-gradient(145deg,#285343,#15372e)] text-[#f4ead4] shadow-[3px_3px_0_#b5965c24,inset_0_1px_1px_#ffffff24] max-[560px]:size-[37px] max-[560px]:rounded-[11px_11px_11px_4px] [&_svg]:size-[29px] max-[560px]:[&_svg]:size-6">
            <BrandMark />
          </span>
          <span className="flex flex-col gap-[5px]">
            <span className="font-display text-[31px] font-semibold leading-none tracking-[-0.035em] max-[560px]:text-[27px]">
              3D <em className="font-medium text-brass not-italic">Бирка</em>
            </span>
            <small className="text-[8px] font-semibold uppercase leading-[1.2] tracking-[0.17em] text-[#5a685e] max-[560px]:text-[7px]">
              Сад начинается с имени
            </small>
          </span>
        </HomeLink>
        <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#5a685e] max-[560px]:hidden">
          <i className="inline-block size-[5px] rounded-full bg-brass" />{" "}
          Мастерская садовых бирок
        </span>
      </header>

      <main
        className={cn(
          "relative z-[1] mx-auto grid w-full max-w-[1320px] grid-cols-[minmax(0,1.02fr)_minmax(390px,0.98fr)] items-center gap-[clamp(24px,4vw,72px)] pt-11 pb-9",
          "max-[1100px]:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] max-[1100px]:gap-5",
          "max-[820px]:max-w-[650px] max-[820px]:grid-cols-[minmax(0,1fr)] max-[820px]:gap-[22px] max-[820px]:pt-[52px] max-[820px]:pb-7 max-[820px]:text-center",
          "max-[560px]:gap-4 max-[560px]:pt-[42px] max-[560px]:pb-[22px]",
          compact && "min-h-full max-[820px]:pt-[38px] max-[820px]:pb-6",
        )}
        aria-labelledby="error-page-title"
      >
        <section className="max-w-[630px] max-[820px]:mx-auto max-[820px]:max-w-[590px]">
          <p className="m-0 mb-6 flex flex-wrap items-center gap-2.5 text-[10px] font-bold uppercase leading-[1.5] tracking-[0.15em] text-[#6b4c23] max-[820px]:justify-center max-[560px]:mb-5 max-[560px]:gap-[7px] max-[560px]:text-[8px] max-[560px]:tracking-[0.12em]">
            <span className="size-[7px] rounded-full bg-brass shadow-[0_0_0_5px_#a57d4612]" />
            Ошибка {code}
            <span className="mx-[3px] h-px w-[30px] bg-[#a57d4666] max-[560px]:w-[18px] max-[370px]:hidden" />
            {content.eyebrow}
          </p>
          <h1
            id="error-page-title"
            className="m-0 font-display text-[clamp(48px,4.7vw,70px)] font-medium leading-[1.04] tracking-[-0.045em] text-ink max-[1100px]:text-[clamp(44px,5.3vw,58px)] max-[560px]:text-[clamp(38px,11vw,48px)] max-[560px]:leading-[1.06] max-[370px]:text-[36px]"
          >
            {content.title}
            <br />
            <em className="font-normal text-sage">{content.accent}</em>
          </h1>
          <p className="m-0 mt-[26px] max-w-[520px] text-[16px] leading-[1.75] text-[#5a685e] max-[820px]:mx-auto max-[560px]:mt-[21px] max-[560px]:text-[15px] max-[560px]:leading-[1.7]">
            {content.description}
          </p>

          {errorId && (
            <p className="m-0 mt-[18px] inline-flex flex-wrap items-baseline gap-1.5 rounded-[7px] border border-[#d7d1c199] bg-[#fffdf766] px-[11px] py-[7px] text-[11px] text-[#6c746a]">
              Код ошибки:{" "}
              <code className="wrap-anywhere font-mono text-[10px] text-[#47564a]">
                {errorId}
              </code>
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-[26px] gap-y-[18px] max-[820px]:justify-center max-[560px]:mt-[27px] max-[560px]:flex-col max-[560px]:gap-2.5">
            {code === "500" ? (
              <>
                <button
                  type="button"
                  className={primaryButton}
                  onClick={onRetry}
                >
                  <RotateCcw aria-hidden="true" className={iconClass} />
                  Попробовать ещё раз
                </button>
                <HomeLink href="/" className={secondaryButton}>
                  На главную
                  <ArrowRight aria-hidden="true" className={iconClass} />
                </HomeLink>
              </>
            ) : code === "401" ? (
              <>
                <Link href="/auth/login" className={primaryButton}>
                  <LogIn aria-hidden="true" className={iconClass} />
                  Войти в аккаунт
                </Link>
                <HomeLink href="/" className={secondaryButton}>
                  На главную
                  <ArrowRight aria-hidden="true" className={iconClass} />
                </HomeLink>
              </>
            ) : (
              <>
                <HomeLink href="/" className={primaryButton}>
                  Вернуться на главную
                  <ArrowRight aria-hidden="true" className={iconClass} />
                </HomeLink>
                <Link href="/#catalog" className={secondaryButton}>
                  Перейти в каталог
                </Link>
              </>
            )}
          </div>
        </section>

        <ErrorIllustration code={code} />
      </main>

      <footer
        className={cn(
          "relative z-[1] mx-auto flex w-full max-w-[1320px] items-center justify-between gap-5 border-t border-[#cfc9b980] pt-[18px] text-[11px] text-[#778173]",
          "max-[560px]:justify-center max-[560px]:pt-[15px] max-[560px]:text-center",
          compact && "hidden",
        )}
      >
        <span className="font-display text-sm italic">
          Сад начинается с имени.
        </span>
        <span className="inline-flex items-center gap-2.5 text-[8px] font-semibold tracking-[0.16em] max-[560px]:hidden">
          3D БИРКА <i className="inline-block size-1 rounded-full bg-brass" />{" "}
          СДЕЛАНО С ЗАБОТОЙ
        </span>
      </footer>
    </div>
  );
}

function ErrorIllustration({ code }: { code: ErrorPageCode }) {
  const content = CONTENT[code];

  return (
    <div
      className="relative h-[520px] w-full min-w-0 select-none max-[1100px]:h-[470px] max-[820px]:mx-auto max-[820px]:h-[390px] max-[820px]:w-[min(100%,480px)] max-[560px]:h-80"
      aria-hidden="true"
    >
      <span className="absolute top-[44%] left-1/2 -translate-x-[53%] -translate-y-1/2 font-display text-[clamp(170px,17vw,246px)] font-medium leading-none tracking-[-0.1em] text-[#23483e09] max-[560px]:text-[150px]">
        {code}
      </span>
      <span
        className={cn(
          "absolute top-[47%] left-1/2 aspect-square w-[min(92%,450px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#a58b5938]",
          "before:absolute before:top-[14%] before:right-[15%] before:size-[7px] before:rounded-full before:border before:border-[#a58b5966] before:bg-milk before:content-['']",
          "after:absolute after:bottom-[8%] after:left-[24%] after:size-[7px] after:rounded-full after:border after:border-[#a58b5966] after:bg-milk after:content-['']",
          "max-[820px]:w-[360px] max-[560px]:w-[290px]",
        )}
      />
      <span className="absolute top-[47%] left-1/2 aspect-square w-[min(72%,350px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#a58b592b] max-[820px]:w-[280px] max-[560px]:w-[225px]" />

      <svg
        className="absolute inset-0 z-[1] h-full w-full overflow-visible text-[#536b51]"
        viewBox="0 0 440 440"
        fill="none"
        aria-hidden="true"
      >
        <g className="origin-[74px_355px] animate-sway motion-reduce:animate-none">
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

      <div
        className={cn(
          "absolute top-[46%] left-[54%] z-[3] size-[238px] origin-[50%_100%] animate-tag-float rounded-[30px_30px_30px_8px] border bg-[linear-gradient(145deg,#fffdf6,#e9dfc7)] motion-reduce:animate-none",
          "shadow-[16px_24px_40px_#203c3224,inset_2px_2px_2px_#ffffffa6,inset_-4px_-5px_8px_#79684214]",
          "max-[1100px]:size-[215px] max-[820px]:top-[44%] max-[820px]:size-[190px] max-[560px]:left-[55%] max-[560px]:size-[164px] max-[560px]:rounded-[23px_23px_23px_7px]",
          code === "500"
            ? "border-[#b79772] bg-[linear-gradient(145deg,#fffaf0,#ead8be)]"
            : "border-[#b6a579]",
        )}
      >
        <span className="absolute inset-[10px] flex flex-col items-center justify-center rounded-[22px_22px_22px_5px] border border-[#23483e20] px-[18px] pt-7 pb-5 text-center text-forest max-[820px]:px-[14px] max-[820px]:pt-[23px] max-[820px]:pb-[14px] max-[560px]:inset-2 max-[560px]:rounded-[17px_17px_17px_4px] max-[560px]:px-2.5 max-[560px]:pt-[21px] max-[560px]:pb-2.5">
          <span className="absolute top-[15px] left-1/2 size-2.5 -translate-x-1/2 rounded-full border border-[#a89872] bg-[#d7ccb2] shadow-[inset_1px_1px_2px_#685b3c36] max-[560px]:top-[11px] max-[560px]:size-2" />
          <span className="mt-2 text-[8px] font-bold uppercase tracking-[0.17em] text-[#7d765f] max-[820px]:text-[7px] max-[560px]:mt-[5px] max-[560px]:text-[6px]">
            {content.marker}
          </span>
          <strong className="mt-[5px] mb-[2px] font-display text-[84px] font-medium leading-none tracking-[-0.07em] max-[1100px]:text-[75px] max-[820px]:text-[66px] max-[560px]:text-[57px]">
            {code}
          </strong>
          <span className="mt-[7px] mb-2.5 h-px w-9 bg-[#a57d4677] max-[560px]:mt-[3px] max-[560px]:mb-1.5" />
          <small className="text-[10px] leading-[1.4] text-[#647063] max-[820px]:text-[9px] max-[560px]:text-[8px]">
            {content.markerNote}
          </small>
        </span>
      </div>
      <span className="absolute top-[calc(46%+102px)] left-[calc(54%-12px)] z-[2] h-[137px] w-[25px] origin-top rotate-[7deg] bg-[linear-gradient(90deg,#b9aa88,#f2e9d5_48%,#a5936c)] [clip-path:polygon(0_0,100%_0,86%_84%,50%_100%,14%_84%)] drop-shadow-[8px_9px_7px_#203c321c] max-[1100px]:top-[calc(46%+91px)] max-[1100px]:h-[132px] max-[820px]:top-[calc(44%+80px)] max-[820px]:h-[103px] max-[560px]:top-[calc(44%+69px)] max-[560px]:left-[calc(55%-10px)] max-[560px]:h-[91px] max-[560px]:w-[21px]" />

      <div className="absolute bottom-[43px] left-[54%] z-[2] h-[45px] w-[290px] -translate-x-1/2 rounded-[50%] border-b border-[#7c856250] before:absolute before:inset-x-0 before:top-[15px] before:bottom-0 before:rounded-[50%] before:bg-[radial-gradient(ellipse,#5161441c,transparent_67%)] before:content-[''] max-[820px]:bottom-7 max-[820px]:w-[250px] max-[560px]:bottom-[25px] max-[560px]:left-[55%] max-[560px]:w-[215px]">
        <span className="absolute bottom-[-3px] left-[19%] size-[5px] rounded-full bg-[#8d8a6c]" />
        <span className="absolute bottom-[-3px] right-[25%] size-[3px] rounded-full bg-[#8d8a6c]" />
        <span className="absolute right-[12%] bottom-[3px] size-1 rounded-full bg-[#8d8a6c]" />
      </div>
      <span className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-2.5 text-[8px] font-semibold tracking-[0.18em] text-[#75806e] max-[560px]:bottom-0 max-[560px]:text-[7px]">
        САДОВЫЙ ЖУРНАЛ{" "}
        <i className="inline-block size-1 rounded-full bg-brass" /> ЛИСТ {code}
      </span>
    </div>
  );
}
