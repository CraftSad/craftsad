"use client";

import { ArrowRight } from "lucide-react";

export function PromiseSection({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  return (
    <section className="[background:#e5e9dc] text-[#213628] py-[65px] px-[0] [&_h2]:[font:400_clamp(38px,4vw,56px)/1.15_Georgia,serif] [&_h2]:tracking-[-.035em] [&_h2]:m-0 [&_h2]:text-[43px] [&_h2]:leading-[1.03] max-[570px]:[&_h2]:text-[36px]">
      <div className="w-[min(100%_-_112px,1320px)] mx-auto max-[1150px]:w-[calc(100%_-_64px)] max-[570px]:w-[calc(100%_-_40px)] max-[800px]:w-[min(100%_-_36px,680px)]">
        <div>
          <h2>
            Чтобы помнить каждый сорт
            <br />и радоваться каждому ростку
          </h2>
        </div>
        <button
          type="button"
          className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#ffffffeb] text-forest border-[#ffffff6b] hover:[background:white]"
          onClick={() => onNavigate("constructor")}
        >
          Создать свои бирки <ArrowRight />
        </button>
      </div>
    </section>
  );
}
