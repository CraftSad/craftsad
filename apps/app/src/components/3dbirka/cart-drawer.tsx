"use client";

import { paths } from "@acme/config";
import { ArrowRight, PackageCheck, ShoppingBag, Truck, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  getPaletteForShape,
  getShapeEntry,
  shapeToSeries,
  tagSeries,
} from "./data";
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
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-[10px] uppercase tracking-[.17em] text-[13px] font-extrabold text-[#8b492e]">
            Ваш заказ
          </span>
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
          className="w-[44px] h-[44px] grid place-items-center border border-solid border-linen [background:white] rounded-full text-ink max-[800px]:[background:#ffffff75] max-[800px]:border-0 [&_svg]:w-[21px] [&_svg]:h-[21px]"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <X />
        </button>
      </div>
      {demoComplete ? (
        <div className="m-[auto] text-center max-w-[330px] [&>svg]:w-[56px] [&>svg]:h-[56px] [&>svg]:text-forest [&_h3]:font-[400] [&_h3]:text-[31px] [&_h3]:[font-family:Georgia,serif] [&_h3]:mt-[18px] [&_h3]:mb-[5px] [&_p]:text-hedge">
          <PackageCheck />
          <h3 ref={completion} tabIndex={-1}>
            Демонстрация завершена
          </h3>
          <p>Заказ не создан. Данные не сохранены и не отправлены.</p>
          <button
            type="button"
            className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
            onClick={onClose}
          >
            Вернуться в магазин
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="m-[auto] text-center max-w-[330px] [&>svg]:w-[56px] [&>svg]:h-[56px] [&>svg]:text-forest [&_h3]:font-[400] [&_h3]:text-[31px] [&_h3]:[font-family:Georgia,serif] [&_h3]:mt-[18px] [&_h3]:mb-[5px] [&_p]:text-hedge">
          <ShoppingBag />
          <h3>Пока пусто</h3>
          <p>Добавьте бирки со своими названиями — они появятся здесь.</p>
          <button
            type="button"
            className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
            onClick={onClose}
          >
            Выбрать бирки
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-[12px] [background:#eaf1e8] text-forest p-[15px] rounded-[14px] text-[13px] font-bold [&_svg]:w-[22px] [&_svg]:h-[22px] [&_svg]:flex-[none]">
            <Truck />
            <span>
              Изготовление за 2 рабочих дня · Доставка в пункт Ozon от 190 ₽
              (бесплатно от 2 000 ₽)
            </span>
          </div>
          <div className="py-[10px] px-[0] flex-[1]">
            {items.map((item) => {
              const entry = getShapeEntry(item.shape);
              const palette = getPaletteForShape(item.shape, item.color);
              const seriesId = shapeToSeries(item.shape);
              const seriesTitle =
                seriesId === "classic"
                  ? ""
                  : `${tagSeries.find((s) => s.id === seriesId)?.title ?? ""} · `;
              return (
                <article
                  className="flex gap-[15px] border-bottom-[1px] border-bottom-[#e6e2da] py-[18px] px-[0] [&_strong]:text-[17px] [&_p]:text-[14px] [&_p]:text-hedge [&_p]:my-[5px] [&_p]:mx-[0] [&_b]:block [&_b]:text-[21px]"
                  key={item.id}
                >
                  <LabelPreview
                    shape={item.shape}
                    color={item.color}
                    name={item.names[0] ?? ""}
                    small
                  />
                  <div>
                    <strong>
                      {item.mixed
                        ? "Микс 10 см + 18 см"
                        : `${seriesTitle}${entry.title}`}
                    </strong>
                    <p>
                      {item.names.length} шт. · {palette.name}
                    </p>
                    <b>{money(item.price)} ₽</b>
                    {item.originalPrice != null &&
                      item.originalPrice > item.price && (
                        <del>{money(item.originalPrice)} ₽</del>
                      )}
                    {item.mixed && (
                      <p>
                        Колышек ·{" "}
                        {
                          item.itemShapes?.filter((shape) => shape === "stake")
                            .length
                        }{" "}
                        шт. / Флажок ·{" "}
                        {
                          item.itemShapes?.filter((shape) => shape === "flag")
                            .length
                        }{" "}
                        шт.
                      </p>
                    )}
                    <button
                      type="button"
                      className="border-0 [background:none] text-forest underline text-[15px] font-bold py-[8px] px-[0] [&_svg]:w-[18px]"
                      onClick={() => onRemove(item.id)}
                    >
                      Убрать
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {checkout && (
            <form
              id="mt-[24px] [&_label]:mt-[5px] [&_input]:rounded-[12px]"
              className="flex flex-col [&_label]:block [&_label]:font-extrabold [&_label]:text-[16px] [&_label]:mb-[9px] [&_input]:w-full [&_input]:border-[1.5px] [&_input]:border-solid [&_input]:border-[#c8cec6] [&_input]:rounded-[12px] [&_input]:[background:white] [&_input]:text-ink [&_input]:py-[14px] [&_input]:px-[16px] [&_input]:text-[18px] [&_input]:leading-[1.5] [&_input]:mb-[17px] mt-[24px] [&_label]:mt-[5px] [&_input]:rounded-[12px]"
              noValidate
              onSubmit={submitCheckout}
            >
              <p className="text-[15px] text-hedge mt-[10px]">
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
                  className="text-[#9b321d] text-[15px] font-bold mt-[-7px] mb-[14px]"
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
                  className="text-[#9b321d] text-[15px] font-bold mt-[-7px] mb-[14px]"
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
                  className="text-[#9b321d] text-[15px] font-bold mt-[-7px] mb-[14px]"
                  role="alert"
                >
                  {errors.city}
                </p>
              )}
              <fieldset
                className="flex [background:#edece6] rounded-[9px] p-[5px] gap-[4px] mb-[24px] border-0 min-w-0 [&_button]:min-h-[49px] [&_button]:flex-[1] [&_button]:border-0 [&_button]:[background:transparent] [&_button]:rounded-[7px] [&_button]:text-ink [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:gap-[7px] [&_button]:font-bold [&_button]:text-[17px] [&_button]:relative [&_button]:isolate [&_svg]:w-[18px] [&_svg]:h-[18px] max-[570px]:[&_button]:text-[13px]"
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
                  className="text-[#9b321d] text-[15px] font-bold mt-[-7px] mb-[14px]"
                  role="alert"
                >
                  {errors.address}
                </p>
              )}
              <p className="text-[15px] text-hedge mt-[10px]">
                Выбор на карте станет доступен после подключения службы
                доставки.
              </p>
              <p className="text-[15px] text-hedge mt-[10px]">
                Нажимая кнопку оформления, вы принимаете условия{" "}
                <Link
                  href={paths.legal.offer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  публичной оферты
                </Link>{" "}
                и даёте{" "}
                <Link
                  href={paths.legal.consent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  согласие на обработку персональных данных
                </Link>{" "}
                в соответствии с{" "}
                <Link
                  href={paths.legal.privacy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  политикой конфиденциальности
                </Link>
                .
              </p>
            </form>
          )}
          <div className="mt-auto border-top-[1px] border-top-[#e6e2da] pt-[20px]">
            <div className="flex justify-between items-center text-[19px] mb-[17px] [&_strong]:font-[700] [&_strong]:text-[31px] [&_strong]:[font-family:Georgia,serif]">
              <span>Итого</span>
              <strong>{money(total)} ₽</strong>
            </div>
            <button
              className="min-h-[59px] py-[17px] px-[25px] rounded-full inline-flex items-center justify-center gap-[17px] font-semibold no-underline border border-solid border-[transparent] [transition:background_.3s,box-shadow_.3s,transform_.3s] whitespace-nowrap text-[16px] relative overflow-hidden hover:[transform:translateY(-2px)] [&_svg]:w-[15px] [&_svg]:h-[15px] [background:#23483e] text-[white] before:content-[''] before:absolute before:inset-[-50%auto_-50%_-70%] before:w-[35%] before:[transform:rotate(25deg)] before:[background:linear-gradient(90deg,transparent,#ffffff35,transparent)] before:[transition:left_.75s] hover:[background:#15372e] hover:shadow-[0_12px_26px_#1b433225] hover:before:left-[140%]"
              type={checkout ? "submit" : "button"}
              form={
                checkout
                  ? "mt-[24px] [&_label]:mt-[5px] [&_input]:rounded-[12px]"
                  : undefined
              }
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
                className="border-0 [background:none] text-forest underline text-[15px] font-bold py-[8px] px-[0] [&_svg]:w-[18px]"
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
