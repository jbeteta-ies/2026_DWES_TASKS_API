#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${1:-node-express-project}"
fail() { printf '\nERROR: %s\n' "$1" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || fail "Docker no está disponible en PATH."
docker compose version >/dev/null 2>&1 || fail "Docker Compose no está disponible."
#if [[ -e "$PROJECT_DIR" ]] && [[ -n "$(find "$PROJECT_DIR" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
#  fail "La carpeta '$PROJECT_DIR' ya existe y no está vacía."
#fi
mkdir -p "$PROJECT_DIR/docker/node" "$PROJECT_DIR/database/init" "$PROJECT_DIR/src"
cat > "$PROJECT_DIR/.env.example" <<'EOF'
APP_PORT=3000
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=dwes
MYSQL_USER=dwes
MYSQL_PASSWORD=dwes
EOF
cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
cat > "$PROJECT_DIR/.gitignore" <<'EOF'
node_modules/
.env
.DS_Store
Thumbs.db
EOF
cat > "$PROJECT_DIR/.dockerignore" <<'EOF'
.git
.env
node_modules
README.md
EOF
cat > "$PROJECT_DIR/.gitattributes" <<'EOF'
* text=auto
*.js text eol=lf
*.json text eol=lf
*.yaml text eol=lf
*.yml text eol=lf
EOF
cat > "$PROJECT_DIR/package.json" <<'EOF'
{
  "name": "node-express-project",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": { "start": "node --watch src/app.js" },
  "dependencies": { "express": "^5.1.0", "mysql2": "^3.14.0" }
}
EOF
cat > "$PROJECT_DIR/docker/node/Dockerfile" <<'EOF'
FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
USER node
CMD ["npm", "start"]
EOF
cat > "$PROJECT_DIR/compose.yaml" <<'EOF'
services:
  node:
    build:
      context: .
      dockerfile: docker/node/Dockerfile
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      PORT: 3000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${MYSQL_DATABASE:-dwes}
      DB_USER: ${MYSQL_USER:-dwes}
      DB_PASSWORD: ${MYSQL_PASSWORD:-dwes}
    volumes:
      - ./src:/app/src:ro
      - node_modules:/app/node_modules
    depends_on:
      mysql:
        condition: service_healthy
  mysql:
    image: mysql:8.4
    ports:
      - "${MYSQL_PORT:-3306}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-dwes}
      MYSQL_USER: ${MYSQL_USER:-dwes}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-dwes}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -p$${MYSQL_ROOT_PASSWORD} --silent"]
      interval: 5s
      timeout: 5s
      retries: 20
      start_period: 20s
volumes:
  node_modules:
  mysql_data:
EOF
cat > "$PROJECT_DIR/src/app.js" <<'EOF'
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);
app.use(express.json());
app.get("/", (_req, res) => res.json({ name: "API Node.js operativa", express: true }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.listen(port, "0.0.0.0", () => console.log(`API escuchando en ${port}`));
EOF
cat > "$PROJECT_DIR/README.md" <<'EOF'
# Node.js, Express y MySQL

```bash
```

Abre http://localhost:3000/ y http://localhost:3000/health.
EOF
(cd "$PROJECT_DIR" && docker compose config >/dev/null)
