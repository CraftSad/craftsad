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
      <span className="w-[48px] h-[52px] border border-solid border-[#b5965c66] rounded-[15px_15px_15px_3px] grid place-items-center [background:#203e33] text-[#e4cf9f] shadow-[3px_3px_0#b5965c30] shrink-0 max-[570px]:w-[34px] max-[570px]:h-[39px] max-[570px]:rounded-[11px_11px_11px_2px] max-[800px]:w-[24px] max-[800px]:h-[37px] [&_svg]:w-[38px] [&_svg]:h-[38px] max-[800px]:[&_svg]:w-[24px] max-[570px]:[&_svg]:w-[29px] max-[570px]:[&_svg]:h-[29px]">
        <BrandMark />
      </span>
      <span className="flex flex-col gap-[5px]">
        <span className="birka-wordmark-name">3D Бирка</span>
        <small>Сад начинается с имени</small>
      </span>
    </>
  );
}
