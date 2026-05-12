# ChemLab TJ

ChemLab TJ — MVP образовательной виртуальной химической лаборатории для школ, лицеев, колледжей и вузов. Frontend остаётся статическим и умеет работать с локальными seed/fallback данными, но основной источник данных для MVP — Go backend и PostgreSQL.

## Запуск frontend

```bash
npm run build
npm run dev
```

Быстрая проверка проекта перед пушем:

```bash
npm run audit
```

Проверка опубликованного сайта:

```bash
npm run smoke:prod
```

По умолчанию smoke проверяет `https://demo-seven-omega-89.vercel.app`. Для другого адреса задайте `CHEMLAB_PROD_URL`. Если нужно падать при недоступном API, добавьте `SMOKE_REQUIRE_API=true`.

Открыть:

- `http://localhost:5173/index.html`
- `http://localhost:5173/demo.html`
- `http://localhost:5173/periodic-table.html`
- `http://localhost:5173/admin.html`

API URL задаётся через `CHEMLAB_API_URL`, по умолчанию: `http://localhost:8080/api`.

## Что улучшено в демо

- Главная страница получила светлую/тёмную тему, активную навигацию по разделам и более точный текст для презентации.
- Полная лаборатория получила краткую инструкцию, кнопку «Быстрый старт», подсказку следующего шага и подсветку нужного действия.
- Добавлены `npm run audit`, `npm run smoke:prod` и GitHub Actions CI для проверки данных, сборки и Go backend.

## Запуск backend

```bash
cd backend
go mod tidy
go run ./cmd/api
```

Переменные окружения см. в `.env.example`.

## База и seed

База остаётся PostgreSQL.

```powershell
$env:DATABASE_URL="host=localhost port=5432 user=postgres password=postgres dbname=chemtj sslmode=disable"
cd backend
.\scripts\migrate.ps1
.\scripts\seed.ps1
```

`seed.ps1` применяет каталог реакций/веществ, MVP-миграцию и создаёт demo-пользователей с bcrypt hash.

Demo admin:
`admin@chemlab.local` / `Admin12345`

Demo user:
`user@chemlab.local` / `User12345`

Демо-аккаунты предназначены только для локальной проверки MVP.

## API endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/substances`
- `GET /api/substances/:id`
- `GET /api/reactions`
- `GET /api/reactions/:id`
- `POST /api/experiments`
- `POST /api/experiments/attempts`
- `GET /api/progress/me`
- `GET /api/periodic-elements`
- `GET /api/periodic-elements/:symbol`

Admin:

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/reactions`
- `POST /api/admin/reactions`
- `GET /api/admin/reactions/:id`
- `PUT /api/admin/reactions/:id`
- `DELETE /api/admin/reactions/:id`
- `PATCH /api/admin/reactions/:id/toggle`
- `GET /api/admin/substances`
- `POST /api/admin/substances`
- `GET /api/admin/substances/:id`
- `PUT /api/admin/substances/:id`
- `DELETE /api/admin/substances/:id`
- `PATCH /api/admin/substances/:id/toggle`
- `GET /api/admin/periodic-elements`
- `PUT /api/admin/periodic-elements/:id`
- `GET /api/admin/experiments`

## Структура

- `backend/cmd/api` — Go API server
- `backend/cmd/seed` — demo user seed
- `backend/internal` — config, db, handlers, middleware, repositories, services
- `backend/migrations` — PostgreSQL migrations
- `data` и `backend/seeddata` — fallback/seed catalog data
- `js/api.js`, `js/auth.js`, `js/admin.js`, `js/i18n.js` — frontend API/auth/admin/i18n слой
- `admin.html` — панель администратора

## Реализовано

- JWT auth, bcrypt passwords, роли `user/admin`
- PostgreSQL-backed реакции, вещества, элементы и попытки опытов
- Admin dashboard, пользователи, CRUD реакций и веществ, редактирование элементов
- Сохранение экспериментов и прогресса пользователя
- API-first лаборатория с fallback на локальные данные
- Таблица Менделеева через backend API с отображением `Нет данных`
- Статический frontend с локальным запуском

## Дальше

- Кабинет учителя, классы и задания
- Аналитика учеников и экспорт отчётов
- Таджикская локализация поверх текущего русского UI
- Более строгая валидация схем API и e2e-тесты с реальной PostgreSQL БД
