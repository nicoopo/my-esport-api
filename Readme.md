# Esport API — Documentation

Stack : **Symfony 7 / PHP 8.4** + **Next.js** · Orchestration via **Docker Compose**

---

## Prérequis

- Docker Desktop (ou Docker Engine + Compose plugin)
- Make (inclus sur Linux/macOS · Windows : via [Chocolatey](https://chocolatey.org/) `choco install make`)
- Node.js 22+ (seulement si tu veux lancer le front hors Docker)

---

## Variables d'environnement

Copier `.env` en `.env.local` et renseigner :

```env
APP_SECRET=<une_chaine_aleatoire>
PANDASCORE_API_TOKEN=<ton_token_pandascore>
```

---

## Démarrage rapide

```bash
# Première fois : build + démarrage
make build

# Fois suivantes
make start
```

| Service   | URL                       |
|-----------|---------------------------|
| API (Symfony) | http://localhost:8000 |
| Frontend (Next.js) | http://localhost:3000 |

---

## Commandes Make

### Docker

| Commande | Description |
|---|---|
| `make build` | Build toutes les images et démarre les conteneurs |
| `make up` | Démarre les conteneurs (sans rebuild) |
| `make down` | Arrête et supprime les conteneurs |
| `make restart` | Redémarre tous les conteneurs |
| `make start` | Alias de `up` — démarre tout |
| `make logs` | Logs de tous les services en temps réel |
| `make logs-php` | Logs du conteneur PHP uniquement |
| `make logs-nginx` | Logs du conteneur Nginx uniquement |

### Symfony

| Commande | Description |
|---|---|
| `make shell` | Shell interactif dans le conteneur PHP |
| `make cache-clear` | Vide le cache Symfony |
| `make routes` | Liste toutes les routes enregistrées |
| `make lint` | Vérifie la config YAML et le container |

### Composer

| Commande | Description |
|---|---|
| `make composer-install` | `composer install` dans le conteneur |
| `make composer-update` | `composer update` dans le conteneur |

### Frontend

| Commande | Description |
|---|---|
| `make frontend-build` | Build l'image Docker du frontend |
| `make frontend-up` | Démarre uniquement le conteneur frontend |
| `make frontend-logs` | Logs du frontend en temps réel |
| `make frontend-shell` | Shell interactif dans le conteneur frontend |

---

## Commandes Docker brutes (sans Make)

### Cycle de vie

```bash
# Démarrer tous les services
docker compose up -d

# Démarrer en rebuild forcé
docker compose up --build -d

# Arrêter sans supprimer les volumes
docker compose stop

# Arrêter et supprimer les conteneurs
docker compose down

# Arrêter et supprimer conteneurs + volumes
docker compose down -v
```

### Logs

```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker compose logs -f php
docker compose logs -f nginx
docker compose logs -f frontend

# N dernières lignes
docker compose logs --tail=50 php
```

### Shells

```bash
# Shell PHP (backend Symfony)
docker compose exec php sh

# Shell frontend (Next.js)
docker compose exec frontend sh

# Shell Nginx (lecture de config, debug)
docker compose exec nginx sh
```

### Symfony via Docker

```bash
# N'importe quelle commande bin/console
docker compose exec php bin/console <commande>

# Exemples
docker compose exec php bin/console cache:clear
docker compose exec php bin/console debug:router
docker compose exec php bin/console make:controller MonController
```

### Composer via Docker

```bash
docker compose exec php composer install
docker compose exec php composer update
docker compose exec php composer require <package>
docker compose exec php composer remove <package>
```

### npm via Docker

```bash
docker compose exec frontend npm install
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

### Images et nettoyage

```bash
# Voir les conteneurs actifs
docker compose ps

# Rebuild une seule image
docker compose build php
docker compose build frontend

# Supprimer les images non utilisées
docker image prune

# Nettoyage complet (conteneurs, images, volumes orphelins)
docker system prune -a
```

---

## Endpoints API disponibles

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/matches/upcoming` | Matchs à venir (tous jeux) |
| `GET` | `/api/matches/upcoming?game=lol` | Matchs à venir filtrés par jeu |
| `GET` | `/api/matches/running` | Matchs en cours |
| `GET` | `/api/matches/past` | Matchs passés |
| `GET` | `/api/matches/{id}` | Détail d'un match |

Paramètres query disponibles : `game`, `page`, `per_page`

Jeux supportés : `lol`, `csgo`, `dota2`, `valorant`, `rl`

---

## Structure du projet

```
.
├── docker-compose.yml
├── Dockerfile                  # PHP 8.4-fpm
├── Makefile
├── docker/
│   └── nginx/
│       └── nginx.conf
├── src/
│   ├── Controller/
│   │   ├── EsportController.php
│   │   └── MatchController.php
│   └── Service/
│       └── PandaScoreService.php
├── frontend/                   # Next.js
│   ├── Dockerfile
│   └── app/
│       ├── page.tsx
│       ├── matches/
│       └── admin/
└── .env
```
