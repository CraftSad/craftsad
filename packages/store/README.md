# 3dbirka API

Отдельный REST API на Bun + Hono. Суммы хранятся в копейках. Каждый сорт в наборе считается отдельной биркой; `quantity` означает число одинаковых наборов.
Сид создаёт пример товара по цене 79 ₽ за бирку; рабочую цену задайте в каталоге перед продажами.

## Запуск

1. Поднимите PostgreSQL (`docker compose up -d postgres`) и настройте `.env` по примеру ниже.
2. Выполните `bun db:migrate` и `bun store:seed`.
3. Для API запустите `bun store:dev`, для генерации — `bun store:worker` в отдельном процессе.
4. Установите OpenSCAD и шрифт Liberation Sans на машине воркера. `OPENSCAD_BIN` может указывать на исполняемый файл.

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:7170f6cba4f6d9ef51872598c8975dacb8d7c8fd8c3830b3e3caa380602ceb98 -->

Для OTP нужен `AUTH_SECRET` и настроенный провайдер отправки писем. Для SMS задайте `SMS_RU_API_ID`. Админ скачивает ZIP с STL и 3MF из карточки заказа в админке через защищённый `GET /api/orders/:id/archive` на адресе админки.

Для локального хранения задайте одинаковый абсолютный `STORE_ARCHIVE_DIR` в корневом `.env` или в окружении приложения Next.js и воркера. На одном хосте создайте каталог, доступный воркеру на запись и приложению на чтение. В контейнерах смонтируйте один постоянный том по тому же пути в оба контейнера (например, `/var/lib/3dbirka/archives`). Путь не зависит от рабочего каталога процессов. Если архивы уже были созданы, сохраните их доступность по путям, записанным в базе.

Если общий том недоступен, настройте один бакет и endpoint S3 через `STORE_S3_*` из `.env.example`: воркеру нужна запись объектов, приложению — чтение.

<!-- /coderabbit-ai-generated:v1 -->

## Авторизация

Better Auth работает по адресу `/api/auth/*`:

- Email: `POST /api/auth/email-otp/send-verification-otp` с `{ "email": "...", "type": "sign-in" }`, затем `POST /api/auth/sign-in/email-otp` с `{ "email": "...", "otp": "..." }`.
- Телефон: `POST /api/auth/phone-number/send-otp` с `{ "phoneNumber": "+79991234567" }`, затем `POST /api/auth/phone-number/verify` с `{ "phoneNumber": "+79991234567", "code": "123456" }`.

Better Auth устанавливает сессионный cookie. Отправляйте запросы к API с `credentials: "include"`. API допускает origin, указанный в `APP_URL`. Администратор назначается через Better Auth admin API или запись роли `admin` в БД доверенным оператором.

## Заказы

`POST /api/constructor/calculate` и `POST /api/orders` принимают `items: [{ productId, quantity, customization }]`. Для бирки customization содержит `shape`, `lengthMm`, `heightMm`, `baseColor`, `textColor`, `varieties: string[]`. Заказ дополнительно требует `ozonCity`, `ozonPvzAddress`, `ozonPvzId`, `customerName`, `customerPhone`; `varietyListName` необязателен. Цена рассчитывается по актуальным данным каталога. `POST /api/orders` создаёт заказ в `pending_payment`.

Подтверждение платежа выполняется доверенной системой или мастером через `PATCH /api/admin/orders/:id/status` со статусом `paid`. Этот переход ставит задачу печати в очередь. Для повторного запуска неудачной генерации повторите статус `paid`. Трек-номер передаётся как `ozonTrackingNumber` при переходе в `shipped_ozon`.

Очередь живёт в PostgreSQL. Воркер атомарно захватывает задачу, обновляет heartbeat, генерирует STL и 3MF для каждой бирки, собирает ZIP и сохраняет его в S3 или локальном volume. 3MF содержит размеры в миллиметрах и цвета корпуса и надписи; STL остаётся без цветовых данных. Неудача отмечается `failed` с текстом ошибки. Уведомления о смене статуса отправляются на телефон и, если есть, на email.
