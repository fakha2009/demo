#!/usr/bin/env sh
set -eu

: "${DATABASE_URL:=host=localhost port=5432 user=postgres password=postgres dbname=chemtj sslmode=disable}"
export DATABASE_URL

for file in migrations/*.sql; do
  echo "Applying $(basename "$file")"
  psql "$DATABASE_URL" -f "$file"
done

echo "Migrations applied."
