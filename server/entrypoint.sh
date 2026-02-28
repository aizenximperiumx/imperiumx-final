#!/bin/sh
set -e
if [ -z "$JWT_SECRET" ]; then
  echo "JWT_SECRET is required" >&2
  exit 1
fi
npx prisma migrate deploy
node dist/index.js
