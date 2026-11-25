import { expect, test } from "@playwright/test";

for (const width of [375, 1440]) {
  test(`3D Бирка constructor and catalog at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page).toHaveTitle(/3D Бирка/);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "3D Бирка",
    );
    await page.getByRole("tab", { name: "В масштабе" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("Стаканчик ≈ 10 см");
    await page.getByRole("button", { name: /^Флажок · 18 см/ }).click();
    await expect(
      page.getByRole("tabpanel").getByRole("img"),
    ).toHaveAccessibleName(/18 см/);
    await page.getByRole("tab", { name: "Живое фото" }).click();
    await page.getByRole("button", { name: "Терракота — Белые буквы" }).click();
    await expect(page.getByRole("tabpanel").getByRole("img")).toHaveCount(2);
    await expect(
      page.getByRole("tabpanel").getByRole("img").first(),
    ).toHaveAttribute("alt", /Терракота/);
    await page.getByRole("tab", { name: "Живое фото" }).press("Home");
    await expect(page.getByRole("tab", { name: "3D-модель" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.getByRole("button", { name: "Какую форму выбрать? →" }).click();
    await expect(page.getByRole("dialog")).toContainText("Отверстие 4 мм");
    await page.keyboard.press("Escape");
    const field = page.getByLabel("Названия сортов, каждое с новой строки");
    await field.fill(
      `\n${"А".repeat(18)}\n${"Б".repeat(19)}\n\n${"В".repeat(29)}`,
    );
    await expect(page.locator(".birka-validation")).toContainText(
      "Строка №5 слишком длинная (29 симв.)",
    );
    await expect(page.locator(".birka-validation")).toContainText(
      "аккуратно перенесём на 2 строки",
    );
    await expect(page.locator(".birka-summary")).toContainText("3 бирок");
    await page.getByRole("button", { name: "Очистить", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Добавить набор в корзину" }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "Томат Бычье сердце", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Томат Бычье сердце", exact: true })
      .click();
    await expect(field).toHaveValue("Томат Бычье сердце\nТомат Бычье сердце");
    await page.getByRole("button", { name: /^Колышек · 10 см/ }).click();
    for (const [count, price] of [
      [14, "840"],
      [15, "810"],
      [29, "1 566"],
      [30, "1 530"],
    ] as const) {
      await field.fill(Array(count).fill("Томат").join("\n"));
      await expect(page.locator(".birka-summary strong")).toHaveText(
        `${price} ₽`,
      );
    }
    await page
      .locator("#constructor")
      .evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.screenshot({
      path: `test-results/3D Бирка-${width}-constructor.png`,
    });
    await page
      .getByRole("button", { name: "Большие наборы −15%", exact: true })
      .click();
    await expect(page.locator(".birka-product")).toHaveCount(1);
    const kit = page.locator(".birka-product");
    await expect(kit).toContainText("1 910 ₽");
    await kit.locator("summary").click();
    await expect(kit).toContainText("Кукуруза Лакомка");
    await kit.getByRole("button", { name: "В корзину", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText(
      "Колышек · 15 шт. / Флажок · 15 шт.",
    );
    await expect(
      page.getByRole("dialog").locator(".birka-total"),
    ).toContainText("1 910 ₽");
    await page.keyboard.press("Escape");
    await kit.getByRole("button", { name: "Настроить список" }).click();
    await expect(field).toHaveValue(/Кукуруза Лакомка$/);
    await expect(page.locator(".birka-summary")).toContainText(
      "Микс 10 см + 18 см",
    );
    await expect(page.locator(".birka-summary strong")).toHaveText("1 910 ₽");
    await field.fill(
      (await field.inputValue()).split("\n").slice(0, 29).join("\n"),
    );
    await expect(page.locator(".birka-summary strong")).toHaveText("1 944 ₽");
    await page
      .getByRole("button", { name: "В теплицу · 8 см", exact: true })
      .click();
    await expect(page.locator(".birka-product")).toHaveCount(1);
    await expect(page.locator(".birka-product")).toContainText(
      "Тепличный сезон",
    );
    await page
      .locator("#catalog")
      .evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.screenshot({
      path: `test-results/3D Бирка-${width}-catalog.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("clipboard appends and permission errors are recoverable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "В масштабе" }).click();
  await expect(page.getByRole("tab", { name: "В масштабе" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { readText: async () => "Мята\nУкроп" },
    }),
  );
  const field = page.getByLabel("Названия сортов, каждое с новой строки");
  await field.fill("Томат");
  await page.getByRole("button", { name: "Вставить из буфера" }).click();
  await expect(field).toHaveValue("Томат\nМята\nУкроп");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        readText: async () => {
          throw new Error("Denied");
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Вставить из буфера" }).click();
  await expect(page.getByText(/Не удалось прочитать буфер/)).toBeVisible();
  await expect(field).toHaveValue("Томат\nМята\nУкроп");
});

test("newsletter rejects invalid input and displays server failures", async ({
  page,
  request,
}) => {
  const response = await request.post("/api/newsletter", {
    data: { email: "bad", consent: true },
  });
  expect(response.status()).toBe(400);
  await page.goto("/");
  await page.route("/api/newsletter", (route) =>
    route.fulfill({
      status: 503,
      json: {
        message:
          "Подписка пока не подключена. Адрес не сохранён; попробуйте позже.",
      },
    }),
  );
  await page
    .getByLabel("Электронная почта", { exact: true })
    .fill("test@example.org");
  await page
    .getByRole("checkbox", { name: /Согласен получать письма/ })
    .check();
  await page.getByRole("button", { name: "Сообщить о новинках" }).click();
  await expect(page.locator("#newsletter [role=status]")).toContainText(
    "Адрес не сохранён",
  );
});
