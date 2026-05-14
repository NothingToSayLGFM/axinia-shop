#!/bin/bash
set -e

REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"
APP_DIR="/opt/axinia"

echo "=== Axinia Market — Initial Deploy ==="

# Swap (needed for 1GB RAM during build)
if [ ! -f /swapfile ]; then
  echo "Creating 2GB swap..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Clone repo
if [ ! -d "$APP_DIR" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "Directory $APP_DIR already exists, skipping clone."
fi

cd "$APP_DIR"

# Create .env
if [ ! -f .env ]; then
  echo ""
  echo "=== Creating .env ==="
  read -p "POSTGRES_PASSWORD: " POSTGRES_PASSWORD
  read -p "NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY: " CLERK_PK
  read -p "NUXT_CLERK_SECRET_KEY: " CLERK_SK
  read -p "NUXT_NOVA_POST_API_KEY: " NP_KEY

  cat > .env <<EOF
POSTGRES_USER=axinia
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://axinia:${POSTGRES_PASSWORD}@db:5432/axinia
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PK}
NUXT_CLERK_SECRET_KEY=${CLERK_SK}
NUXT_NOVA_POST_API_KEY=${NP_KEY}
EOF
  echo ".env created."
fi

# Build and start
echo "=== Building and starting containers... ==="
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
echo "=== Running DB migrations... ==="
sleep 5
docker compose -f docker-compose.prod.yml exec app node -e "
const { execSync } = require('child_process');
execSync('npx prisma migrate deploy', { stdio: 'inherit' });
" || docker exec axinia-app npx prisma migrate deploy

echo ""
echo "=== Done! App running at http://$(curl -s ifconfig.me):3001 ==="
