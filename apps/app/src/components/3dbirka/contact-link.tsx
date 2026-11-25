"use client";

import { Send, X } from "lucide-react";
import { useState } from "react";
import { StorefrontDialog } from "./ui";

export function ContactLink({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const url = process.env.NEXT_PUBLIC_3D Бирка_CONTACT_URL;
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
          className="birka-contact"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Связаться с мастерской в Telegram или WhatsApp"
        >
          {content}
        </a>
      ) : (
        <button
          className="birka-contact"
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
            className="birka-icon-button"
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
