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

Get-ChildItem .\migrations\*.sql | Sort-Object Name | ForEach-Object {
  Write-Host "Applying $($_.Name)"
  & $psql $env:DATABASE_URL -f $_.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "Migration failed: $($_.Name)"
  }
}

Write-Host "Migrations applied."
