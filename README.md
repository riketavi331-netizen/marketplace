# Marketplace MVP

Локальный маркетплейс одежды и обуви с AI-стилистом.

## Требования

- **Node.js** 20+ → [nodejs.org](https://nodejs.org)
- **Docker Desktop** → [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

## Быстрый старт

```bash
# 1. Добавь свой Anthropic API ключ
nano backend/.env
# Замени: ANTHROPIC_API_KEY="sk-ant-YOUR_KEY_HERE"

# 2. Запусти всё
./start.sh
```

## Что запускается

| Сервис | URL |
|--------|-----|
| Frontend (Next.js) | http://localhost:3000 |
| Backend API (NestJS) | http://localhost:3001/api |
| Swagger документация | http://localhost:3001/api/docs |
| MinIO (файлы) | http://localhost:9001 |
| Prisma Studio (БД) | `cd backend && npx prisma studio` |

## Тестовый аккаунт (после seed)

- Email: `admin@marketplace.local`
- Password: `admin123`

## Структура

```
marketplace/
├── backend/          NestJS API
│   ├── src/
│   │   ├── auth/         Регистрация, вход, JWT
│   │   ├── users/        Профиль, история заказов
│   │   ├── products/     Каталог, фильтры
│   │   ├── stores/       Магазины
│   │   ├── orders/       Заказы, статистика
│   │   ├── cart/         Корзина (Redis)
│   │   ├── ai-assistant/ AI-стилист (Claude)
│   │   └── admin/        Дашборд
│   └── prisma/       Schema + миграции
├── frontend/         Next.js 14
│   └── src/
│       ├── app/      Страницы
│       ├── components/ Компоненты
│       ├── store/    Zustand (корзина, авторизация)
│       └── lib/      API клиент, типы
└── docker-compose.yml  PostgreSQL + Redis + MinIO
```

## API эндпоинты

```
POST /api/auth/register     Регистрация
POST /api/auth/login        Вход

GET  /api/products          Каталог (фильтры: search, categoryId, gender, minPrice, maxPrice)
GET  /api/products/:id      Товар
GET  /api/products/categories  Категории

GET  /api/stores            Магазины
GET  /api/stores/:id        Магазин с товарами

GET  /api/cart              Корзина
POST /api/cart              Добавить в корзину
PATCH /api/cart             Изменить количество
DELETE /api/cart            Очистить

POST /api/orders            Создать заказ
GET  /api/orders/:id        Заказ
GET  /api/users/me/orders   Мои заказы

POST /api/ai-assistant/chat AI-стилист

GET  /api/admin/dashboard   Статистика
GET  /api/admin/users       Пользователи
GET  /api/admin/orders      Все заказы
```
