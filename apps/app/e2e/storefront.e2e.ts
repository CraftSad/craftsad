import { expect, test } from "@playwright/test";

test("validates demo login and keeps the account openable with the keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Войти", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog");
  const phone = dialog.getByRole("textbox", { name: "Номер телефона" });
  const requestCode = dialog.getByRole("button", { name: "Получить код" });
  await expect(phone).toBeFocused();
  await requestCode.focus();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Закрыть", exact: true }),
  ).toBeFocused();
  await phone.fill("8123");
  await requestCode.click();
  await expect(phone).toHaveAccessibleDescription(
    "Введите номер телефона полностью",
  );

  for (const value of ["8123456789", "+78123456789"]) {
    await phone.fill(value);
    await requestCode.click();
    await expect(dialog.getByText(/\+7 \(812\) 345-67-89/)).toBeVisible();
    await expect(dialog.getByLabel("Код из 4 цифр")).toBeFocused();
    if (value === "8123456789") {
      await dialog
        .getByRole("button", { name: "Изменить номер или почту" })
        .click();
      await expect(phone).toBeFocused();
    }
  }
  await dialog.getByLabel("Код из 4 цифр").fill("1234");
  await dialog.getByRole("button", { name: "Войти", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();

  await opener.press("Enter");
  const orders = dialog.getByRole("tab", { name: "Мои заказы" });
  const help = dialog.getByRole("tab", { name: "Помощь мастера" });
  await expect(orders).toHaveAttribute("aria-selected", "true");
  await orders.press("ArrowLeft");
  await expect(help).toBeFocused();
  await expect(help).toHaveAttribute("aria-selected", "true");
  await expect(
    dialog.getByRole("tabpanel", { name: "Помощь мастера" }),
  ).toBeVisible();
  await help.press("ArrowRight");
  await expect(orders).toBeFocused();
});

test("shows the full inscription and validates checkout on a short viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 510 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "360°" }).click();
  await expect(
    page.getByRole("img", { name: /Объёмная бирка:|Бирка:/ }).last(),
  ).toBeVisible();

  const name = "Очень длинное название сорта ".repeat(12).trim();
  const names = page.getByLabel("Названия сортов, каждое с новой строки");
  await names.click();
  await names.fill([name, ...Array(20).fill("Томат")].join("\n"));
  const fullName = page
    .locator(".birka-preview-pager")
    .getByText(name, { exact: true });
  await expect(fullName).toBeVisible();
  await expect(fullName).toHaveCSS("white-space", "normal");
  await expect(page.getByText(/^21 бирок ·/)).toBeVisible();
  await page.getByRole("button", { name: "Добавить набор в корзину" }).click();

  const cart = page.getByRole("dialog");
  const thumbnail = cart.locator(".birka-preview");
  await expect(thumbnail).toHaveCSS("width", "95px");
  await expect(thumbnail).toHaveCSS("height", "95px");
  await expect(thumbnail).toHaveCSS("transform", "none");
  await cart.getByRole("button", { name: "Оформить заказ" }).click();
  await expect(cart.getByText(/Введённые данные не сохраняются/)).toBeVisible();

  const submit = cart.getByRole("button", { name: "Завершить демонстрацию" });
  await cart.getByLabel("Имя", { exact: true }).fill(" ");
  await submit.click();
  await expect(cart.getByRole("alert")).toHaveCount(4);
  await expect(
    cart.getByLabel("Телефон", { exact: true }),
  ).toHaveAccessibleDescription("Введите номер телефона полностью");
  await cart.getByLabel("Имя", { exact: true }).fill("Тест");
  await cart.getByLabel("Телефон", { exact: true }).fill("8123456789");
  await cart.getByLabel("Город", { exact: true }).fill("Тестовый город");
  await cart.getByLabel("Адрес удобного пункта Ozon").fill("Тестовая, 1");
  await submit.click();
  await expect(
    cart.getByRole("heading", { name: "Демонстрация завершена" }),
  ).toBeFocused();
  await expect(cart.getByText(/Заказ не создан/)).toBeVisible();
});
