#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Marketplace MVP — Запуск ===${NC}\n"

# 1. Docker
echo -e "${YELLOW}[1/5] Запуск Docker (PostgreSQL, Redis, MinIO)...${NC}"
docker compose up -d
echo "Ждём готовности БД..."
sleep 5

# 2. Backend deps
echo -e "${YELLOW}[2/5] Установка зависимостей backend...${NC}"
cd backend
npm install

# 3. Prisma
echo -e "${YELLOW}[3/5] Применение миграций и seed...${NC}"
cp .env .env 2>/dev/null || true
npx prisma generate
npx prisma migrate dev --name init
npx ts-node --project tsconfig.json prisma/seed.ts

# 4. Frontend deps
echo -e "${YELLOW}[4/5] Установка зависимостей frontend...${NC}"
cd ../frontend
npm install

# 5. Start
echo -e "${YELLOW}[5/5] Запуск серверов...${NC}"
cd ..

# Backend в фоне
cd backend && npm run start:dev &
BACKEND_PID=$!
cd ..

sleep 3

# Frontend в фоне
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✓ Всё запущено!${NC}"
echo ""
echo "  Frontend:     http://localhost:3000"
echo "  Backend API:  http://localhost:3001/api"
echo "  Swagger docs: http://localhost:3001/api/docs"
echo "  MinIO:        http://localhost:9001  (admin / secret123)"
echo "  Prisma Studio: запусти: cd backend && npx prisma studio"
echo ""
echo -e "${YELLOW}Для остановки: Ctrl+C${NC}"

# Ждём Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose stop; echo 'Остановлено.'" EXIT
wait
