"use client";

import { paths } from "@acme/config";
import { ArrowRight, PackageCheck, ShoppingBag, Truck, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { colorPairs, shapes } from "./data";
import { type CartItem, money, phoneSchema } from "./shared";
import { LabelPreview, StorefrontDialog } from "./ui";

const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Введите имя"),
  phone: phoneSchema,
  city: z.string().trim().min(1, "Введите город"),
  address: z.string().trim().min(1, "Введите адрес пункта выдачи"),
});

export function CartDrawer({
  items,
  onClose,
  onRemove,
}: {
  items: CartItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
}) {
  const [checkout, setCheckout] = useState(false);
  const [delivery, setDelivery] = useState<"list" | "map">("list");
  const [demoComplete, setDemoComplete] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof checkoutSchema>, string>>
  >({});
  const nameInput = useRef<HTMLInputElement>(null);
  const completion = useRef<HTMLHeadingElement>(null);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  useEffect(() => {
    if (demoComplete) completion.current?.focus();
    else if (checkout) nameInput.current?.focus();
  }, [checkout, demoComplete]);
  const submitCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const result = checkoutSchema.safeParse({
      name: fields.get("name"),
      phone: fields.get("phone"),
      city: fields.get("city"),
      address: fields.get("address"),
    });
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
        city: fieldErrors.city?.[0],
        address: fieldErrors.address?.[0],
      });
      return;
    }
    setErrors({});
    setDemoComplete(true);
  };
  return (
    <StorefrontDialog titleId="cart-title" onClose={onClose} drawer>
      <div className="birka-drawer-head">
        <div>
          <span className="birka-eyebrow">Ваш заказ</span>
          <h2 id="cart-title">
            {demoComplete
              ? "Результат оформления"
              : checkout
                ? "Оформление"
                : "Корзина"}
          </h2>
        </div>
        <button
          type="button"
          className="birka-icon-button"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <X />
        </button>
      </div>
      {demoComplete ? (
        <div className="birka-empty">
          <PackageCheck />
          <h3 ref={completion} tabIndex={-1}>
            Демонстрация завершена
          </h3>
          <p>Заказ не создан. Данные не сохранены и не отправлены.</p>
          <button
            type="button"
            className="birka-button birka-button-primary"
            onClick={onClose}
          >
            Вернуться в магазин
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="birka-empty">
          <ShoppingBag />
          <h3>Пока пусто</h3>
          <p>Добавьте бирки со своими названиями — они появятся здесь.</p>
          <button
            type="button"
            className="birka-button birka-button-primary"
            onClick={onClose}
          >
            Выбрать бирки
          </button>
        </div>
      ) : (
        <>
          <div className="birka-delivery-note">
            <Truck />
            <span>
              Доставка в пункт выдачи Ozon по всей России — обычно 2–4 дня
            </span>
          </div>
          <div className="birka-cart-items">
            {items.map((item) => (
              <article className="birka-cart-item" key={item.id}>
                <LabelPreview
                  shape={item.shape}
                  color={item.color}
                  name={item.names[0] ?? ""}
                  small
                />
                <div>
                  <strong>
                    {shapes.find((shape) => shape.id === item.shape)?.title}
                  </strong>
                  <p>
                    {item.names.length} шт. ·{" "}
                    {(colorPairs[item.color] ?? colorPairs[0]).name}
                  </p>
                  <b>{money(item.price)} ₽</b>
                  <button
                    type="button"
                    className="birka-text-button"
                    onClick={() => onRemove(item.id)}
                  >
                    Убрать
                  </button>
                </div>
              </article>
            ))}
          </div>
          {checkout && (
            <form
              id="birka-checkout"
              className="birka-form birka-checkout"
              noValidate
              onSubmit={submitCheckout}
            >
              <p className="birka-helper">
                Это демонстрация оформления. Введённые данные не сохраняются и
                не отправляются. Можно использовать вымышленные данные.
              </p>
              <label htmlFor="customer-name">Имя</label>
              <input
                ref={nameInput}
                id="customer-name"
                name="name"
                autoComplete="name"
                required
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "checkout-name-error" : undefined
                }
                placeholder="Как к вам обращаться"
              />
              {errors.name && (
                <p
                  id="checkout-name-error"
                  className="birka-error"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
              <label htmlFor="customer-phone">Телефон</label>
              <input
                id="customer-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                aria-invalid={!!errors.phone}
                aria-describedby={
                  errors.phone ? "checkout-phone-error" : undefined
                }
                placeholder="+7 (999) 123-45-67"
              />
              {errors.phone && (
                <p
                  id="checkout-phone-error"
                  className="birka-error"
                  role="alert"
                >
                  {errors.phone}
                </p>
              )}
              <label htmlFor="customer-city">Город</label>
              <input
                id="customer-city"
                name="city"
                required
                placeholder="Ваш город"
                aria-invalid={!!errors.city}
                aria-describedby={
                  errors.city ? "checkout-city-error" : undefined
                }
              />
              {errors.city && (
                <p
                  id="checkout-city-error"
                  className="birka-error"
                  role="alert"
                >
                  {errors.city}
                </p>
              )}
              <fieldset
                className="birka-segmented"
                aria-label="Способ выбора пункта выдачи"
              >
                <button
                  type="button"
                  className={delivery === "list" ? "active" : ""}
                  onClick={() => setDelivery("list")}
                >
                  Из списка
                </button>
                <button
                  type="button"
                  className={delivery === "map" ? "active" : ""}
                  onClick={() => setDelivery("map")}
                >
                  На карте
                </button>
              </fieldset>
              <label htmlFor="ozon-address">Адрес удобного пункта Ozon</label>
              <input
                id="ozon-address"
                name="address"
                aria-invalid={!!errors.address}
                aria-describedby={
                  errors.address ? "checkout-address-error" : undefined
                }
                required
                placeholder={
                  delivery === "map"
                    ? "Напишите адрес пункта с карты Ozon"
                    : "Улица и номер пункта выдачи"
                }
              />
              {errors.address && (
                <p
                  id="checkout-address-error"
                  className="birka-error"
                  role="alert"
                >
                  {errors.address}
                </p>
              )}
              <p className="birka-helper">
                Выбор на карте станет доступен после подключения службы
                доставки.
              </p>
              <p className="birka-helper">
                Нажимая кнопку оформления, вы принимаете условия{" "}
                <Link
                  href={paths.legal.offer}
                  className="underline underline-offset-2"
                >
                  публичной оферты
                </Link>{" "}
                и даёте{" "}
                <Link
                  href={paths.legal.consent}
                  className="underline underline-offset-2"
                >
                  согласие на обработку персональных данных
                </Link>{" "}
                в соответствии с{" "}
                <Link
                  href={paths.legal.privacy}
                  className="underline underline-offset-2"
                >
                  политикой конфиденциальности
                </Link>
                .
              </p>
            </form>
          )}
          <div className="birka-cart-footer">
            <div className="birka-total">
              <span>Итого</span>
              <strong>{money(total)} ₽</strong>
            </div>
            <button
              className="birka-button birka-button-primary"
              type={checkout ? "submit" : "button"}
              form={checkout ? "birka-checkout" : undefined}
              onClick={
                checkout
                  ? undefined
                  : (event) => {
                      event.preventDefault();
                      setCheckout(true);
                    }
              }
            >
              {checkout ? "Завершить демонстрацию" : "Оформить заказ"}
              <ArrowRight />
            </button>
            {checkout && (
              <button
                type="button"
                className="birka-text-button"
                onClick={() => {
                  setErrors({});
                  setCheckout(false);
                }}
              >
                Вернуться в корзину
              </button>
            )}
          </div>
        </>
      )}
    </StorefrontDialog>
  );
}
