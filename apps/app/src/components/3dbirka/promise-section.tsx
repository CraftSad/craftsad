"use client";

import { ArrowRight } from "lucide-react";

export function PromiseSection({
  onNavigate,
}: {
  onNavigate: (id: string) => void;
}) {
  return (
    <section className="birka-promise">
      <div className="birka-container">
        <div>
          <h2>
            Чтобы помнить каждый сорт
            <br />и радоваться каждому ростку
          </h2>
        </div>
        <button
          type="button"
          className="birka-button birka-button-light"
          onClick={() => onNavigate("constructor")}
        >
          Создать свои бирки <ArrowRight />
        </button>
      </div>
    </section>
  );
}
