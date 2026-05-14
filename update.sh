#!/bin/bash
set -e

APP_DIR="/opt/axinia"

echo "=== Axinia Market — Update ==="

cd "$APP_DIR"

git pull

docker compose -f docker-compose.prod.yml up -d --build app

echo "=== Running migrations... ==="
sleep 5
docker exec axinia-app npx prisma migrate deploy

echo "=== Update complete! ==="
