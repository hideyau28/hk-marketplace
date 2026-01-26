#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
ENV_EXAMPLE="$ROOT_DIR/.env.example"
ENV_LOCAL="$ROOT_DIR/.env.local"

DATABASE_URL="${1:-}"
ADMIN_SECRET="${2:-}"

if [[ ! -f "$ENV_LOCAL" ]]; then
  if [[ -f "$ENV_EXAMPLE" ]]; then
    cp "$ENV_EXAMPLE" "$ENV_LOCAL"
    echo "Created .env.local from .env.example"
  else
    echo "Missing .env.example; create .env.local manually."
  fi
else
  echo ".env.local already exists; leaving it unchanged"
fi

if [[ -f "$ENV_LOCAL" ]]; then
  if [[ -z "$DATABASE_URL" ]]; then
    read -r -p "DATABASE_URL: " DATABASE_URL
  fi

  if [[ -z "$ADMIN_SECRET" ]]; then
    read -r -p "ADMIN_SECRET: " ADMIN_SECRET
  fi

  if grep -q "^NEXT_PUBLIC_ADMIN_SECRET=" "$ENV_LOCAL"; then
    echo "WARNING: NEXT_PUBLIC_ADMIN_SECRET detected in .env.local. Remove it to avoid leaks."
  fi

  if grep -q "^DATABASE_URL=" "$ENV_LOCAL"; then
    sed -i '' "s#^DATABASE_URL=.*#DATABASE_URL=$DATABASE_URL#" "$ENV_LOCAL"
  else
    printf "\nDATABASE_URL=%s\n" "$DATABASE_URL" >> "$ENV_LOCAL"
  fi

  if grep -q "^ADMIN_SECRET=" "$ENV_LOCAL"; then
    sed -i '' "s#^ADMIN_SECRET=.*#ADMIN_SECRET=$ADMIN_SECRET#" "$ENV_LOCAL"
  else
    printf "\nADMIN_SECRET=%s\n" "$ADMIN_SECRET" >> "$ENV_LOCAL"
  fi
fi

echo "Running: npx prisma generate"
npx prisma generate --schema="$ROOT_DIR/prisma/schema.prisma"
echo "Running: npx prisma migrate deploy"
npx prisma migrate deploy --schema="$ROOT_DIR/prisma/schema.prisma"
echo "Running: npm run smoke:prod"
npm run smoke:prod

echo "Next steps: npm run dev"