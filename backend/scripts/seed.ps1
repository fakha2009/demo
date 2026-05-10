$ErrorActionPreference = "Stop"

if (-not $env:DATABASE_URL) {
  $env:DATABASE_URL = "host=localhost port=5432 user=postgres password=postgres dbname=chemtj sslmode=disable"
}
if (-not $env:PGCLIENTENCODING) {
  $env:PGCLIENTENCODING = "UTF8"
}

$psql = (Get-Command psql -ErrorAction SilentlyContinue).Source
if (-not $psql) {
  $psql = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $psql) {
  throw "psql was not found. Install PostgreSQL or add psql.exe to PATH."
}

Write-Host "Applying 006_seed_catalog_data.sql"
& $psql $env:DATABASE_URL -f .\migrations\006_seed_catalog_data.sql
if ($LASTEXITCODE -ne 0) {
  throw "Seed failed: 006_seed_catalog_data.sql"
}
Write-Host "Applying 007_postgres_mvp_admin.sql"
& $psql $env:DATABASE_URL -f .\migrations\007_postgres_mvp_admin.sql
if ($LASTEXITCODE -ne 0) {
  throw "Seed failed: 007_postgres_mvp_admin.sql"
}
Write-Host "Seeding demo users"
go run ./cmd/seed
if ($LASTEXITCODE -ne 0) {
  throw "Demo user seed failed"
}
Write-Host "Seed data applied."
