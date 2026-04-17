#!/bin/sh
set -e

mkdir -p uploads

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting backend..."
exec node dist/main
