.DEFAULT_GOAL := help

DOCKER_COMPOSE = docker compose
PHP            = $(DOCKER_COMPOSE) exec php
CONSOLE        = $(PHP) bin/console

.PHONY: help build up down restart logs shell \
        cache-clear routes lint composer-install composer-update

# ============================================================
# AIDE
# ============================================================

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ============================================================
# DOCKER
# ============================================================

build: ## Build les images Docker
	$(DOCKER_COMPOSE) up --build -d

up: ## Démarre les conteneurs
	$(DOCKER_COMPOSE) up -d

down: ## Arrête et supprime les conteneurs
	$(DOCKER_COMPOSE) down

restart: down up ## Redémarre les conteneurs

logs: ## Affiche les logs en temps réel
	$(DOCKER_COMPOSE) logs -f

logs-php: ## Affiche les logs PHP uniquement
	$(DOCKER_COMPOSE) logs -f php

logs-nginx: ## Affiche les logs Nginx uniquement
	$(DOCKER_COMPOSE) logs -f nginx

# ============================================================
# SYMFONY
# ============================================================

shell: ## Ouvre un shell dans le conteneur PHP
	$(PHP) sh

cache-clear: ## Vide le cache Symfony
	$(CONSOLE) cache:clear

routes: ## Liste toutes les routes
	$(CONSOLE) debug:router

lint: ## Vérifie la config Symfony
	$(CONSOLE) lint:yaml config/
	$(CONSOLE) debug:container --deprecations

# ============================================================
# COMPOSER
# ============================================================

composer-install: ## composer install
	$(PHP) composer install

composer-update: ## composer update
	$(PHP) composer update
