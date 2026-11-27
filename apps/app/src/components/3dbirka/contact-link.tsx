"use client";

import { Send, X } from "lucide-react";
import { useState } from "react";
import { StorefrontDialog } from "./ui";

export function ContactLink({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const url = process.env.NEXT_PUBLIC_CRAFTSAD_CONTACT_URL;
  const content = (
    <>
      <Send aria-hidden="true" />
      <span>{compact ? "Связаться" : "Индивидуальный заказ"}</span>
    </>
  );
  return (
    <>
      {url ? (
        <a
          className="[&_svg]:w-[16px] [&_svg]:h-[16px] [&>span]:inline"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Связаться с мастерской в Telegram или WhatsApp"
        >
          {content}
        </a>
      ) : (
        <button
          className="[&_svg]:w-[16px] [&_svg]:h-[16px] [&>span]:inline"
          type="button"
          aria-label="Связаться с мастерской"
          onClick={() => setOpen(true)}
        >
          {content}
        </button>
      )}
      {open && (
        <StorefrontDialog
          titleId="contact-title"
          onClose={() => setOpen(false)}
        >
          <button
            type="button"
            className="w-[44px] h-[44px] grid place-items-center border border-solid border-linen [background:white] rounded-full text-ink max-[800px]:[background:#ffffff75] max-[800px]:border-0 [&_svg]:w-[21px] [&_svg]:h-[21px]"
            aria-label="Закрыть контакты"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
          <h2 id="contact-title">Индивидуальный заказ</h2>
          <p>
            Контакт мастерской в Telegram или WhatsApp скоро появится здесь.
          </p>
        </StorefrontDialog>
      )}
    </>
  );
}
