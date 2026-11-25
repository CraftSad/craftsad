/** A layered garden marker: the product, its printed relief, and a growing shoot. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m13 8 24 4v23l-11 8V31L13 27Z"
        fill="currentColor"
        opacity=".22"
      />
      <path
        d="M9 5h25v23H23v13l-5-5v-8H9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m34 5 5 5v23l-16 8M34 28l5 5M18 36l5 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M22 23v-8m0 4c-6 0-8-3-8-7 5 0 8 2 8 7Zm0-3c0-5 3-7 7-7 0 4-2 7-7 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLockup() {
  return (
    <>
      <span className="birka-brand-mark">
        <BrandMark />
      </span>
      <span className="birka-wordmark">
        <span className="birka-wordmark-name">3D Бирка</span>
        <small>Сад начинается с имени</small>
      </span>
    </>
  );
}
