GREEN  = \033[0;32m
YELLOW = \033[1;33m
RED    = \033[0;31m
NC     = \033[0m

STAGING_COMPOSE = -f docker/docker-compose.prod.yml -f docker/docker-compose.staging.yml
PROD_COMPOSE    = -f docker/docker-compose.prod.yml

.PHONY: help dev staging prod stop-dev stop-staging stop-prod \
        logs-dev logs-staging logs-prod migrate migrate-staging \
        migrate-prod seed studio install gen-secrets

help: ## Показать справку
	@echo ""
	@echo "  $(GREEN)Marketplace MVP$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  make %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# ─────────────────────────────────────────────
# DEV — инфра в Docker, код запускается локально
# ─────────────────────────────────────────────
dev: ## Запустить DEV
	@echo "$(GREEN)[DEV] Запуск инфраструктуры...$(NC)"
	@cp envs/.env.dev backend/.env
	@cp envs/.env.dev frontend/.env.local
	@docker compose -f docker/docker-compose.dev.yml \
		--env-file envs/.env.dev \
		--project-name marketplace_dev up -d
	@echo "$(GREEN)[DEV] Запуск серверов...$(NC)"
	@cd backend && npm run start:dev &
	@cd frontend && npm run dev &
	@echo ""
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:3001/api"
	@echo "  Swagger:   http://localhost:3001/api/docs"
	@echo "  MinIO:     http://localhost:9001"
	@echo ""

stop-dev: ## Остановить DEV
	@docker compose -f docker/docker-compose.dev.yml --project-name marketplace_dev down
	@pkill -f "nest start" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "$(GREEN)[DEV] Остановлено$(NC)"

# ─────────────────────────────────────────────
# STAGING — prod-конфиг + staging overrides
# Идентичен проду, только другие порты и env
# ─────────────────────────────────────────────
staging: ## Собрать и запустить STAGING (= prod-конфиг + staging env)
	@echo "$(YELLOW)[STAGING] Сборка...$(NC)"
	@docker compose $(STAGING_COMPOSE) \
		--env-file envs/.env.staging \
		--project-name marketplace_staging \
		up -d --build
	@echo ""
	@echo "  Staging:   http://localhost:8080"
	@echo "  MinIO:     http://localhost:9003"
	@echo ""

stop-staging: ## Остановить STAGING
	@docker compose $(STAGING_COMPOSE) --project-name marketplace_staging down
	@echo "$(YELLOW)[STAGING] Остановлено$(NC)"

logs-staging: ## Логи STAGING
	@docker compose $(STAGING_COMPOSE) --project-name marketplace_staging logs -f

migrate-staging: ## Миграции STAGING
	@docker compose $(STAGING_COMPOSE) \
		--project-name marketplace_staging \
		exec backend npx prisma migrate deploy

# ─────────────────────────────────────────────
# PROD
# ─────────────────────────────────────────────
prod: _check-prod-secrets ## Собрать и запустить PROD
	@echo "$(RED)[PROD] Сборка...$(NC)"
	@docker compose $(PROD_COMPOSE) \
		--env-file envs/.env.prod \
		--project-name marketplace_prod \
		up -d --build
	@echo ""
	@echo "  Production: https://yourdomain.com"
	@echo ""

stop-prod: ## Остановить PROD
	@docker compose $(PROD_COMPOSE) --project-name marketplace_prod down
	@echo "$(RED)[PROD] Остановлено$(NC)"

logs-prod: ## Логи PROD
	@docker compose $(PROD_COMPOSE) --project-name marketplace_prod logs -f

migrate-prod: ## Миграции PROD
	@docker compose $(PROD_COMPOSE) \
		--project-name marketplace_prod \
		exec backend npx prisma migrate deploy

_check-prod-secrets:
	@grep -q "STRONG_PASSWORD_CHANGE_ME" envs/.env.prod && \
		{ echo "$(RED)ОШИБКА: Замени POSTGRES_PASSWORD в envs/.env.prod$(NC)"; exit 1; } || true
	@grep -q "REPLACE_WITH_64_CHAR" envs/.env.prod && \
		{ echo "$(RED)ОШИБКА: Замени JWT_SECRET в envs/.env.prod$(NC)"; exit 1; } || true

# ─────────────────────────────────────────────
# DB
# ─────────────────────────────────────────────
migrate: ## Миграции DEV
	@cd backend && npx prisma migrate dev

seed: ## Тестовые данные DEV
	@cd backend && npx ts-node prisma/seed.ts

studio: ## Prisma Studio DEV
	@cd backend && npx prisma studio

# ─────────────────────────────────────────────
# Utils
# ─────────────────────────────────────────────
install: ## Установить все зависимости
	@cd backend && npm install
	@cd frontend && npm install
	@cd mobile && npm install

gen-secrets: ## Сгенерировать секреты для prod
	@echo "$(GREEN)Вставь в envs/.env.prod:$(NC)"
	@printf "JWT_SECRET=" && openssl rand -base64 48
	@printf "POSTGRES_PASSWORD=" && openssl rand -base64 24
	@printf "REDIS_PASSWORD=" && openssl rand -base64 24
