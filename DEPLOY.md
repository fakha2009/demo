# Deploy ChemLab TJ

## Local Frontend

```powershell
Copy-Item .env.example .env
npm run build
npm run dev
```

Set:

```env
VITE_API_BASE_URL=http://localhost:8080
```

If the API is unavailable, the frontend continues in demo-mode using local data.

## Local Backend

```powershell
cd backend
Copy-Item .env.example .env
go mod tidy
go run ./cmd/api
```

The backend reads:

```env
APP_ENV=development
PORT=8080
DATABASE_URL=host=localhost port=5432 user=postgres password=postgres dbname=chemtj sslmode=disable
JWT_SECRET=change-me-use-a-long-random-secret
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Do not commit real `JWT_SECRET` or production `DATABASE_URL`.

## Local PostgreSQL

Create the database:

```powershell
createdb -U postgres chemtj
```

If `createdb` is not in PATH, use the full PostgreSQL bin path, for example:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres chemtj
```

Apply migrations:

```bash
export DATABASE_URL="host=localhost port=5432 user=postgres password=postgres dbname=chemtj sslmode=disable"
for f in backend/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

PowerShell:

```powershell
$env:DATABASE_URL="host=localhost port=5432 user=postgres password=postgres dbname=chemtj sslmode=disable"
cd backend
.\scripts\migrate.ps1
```

`migrate.ps1` automatically looks for `psql.exe` in PATH and in `C:\Program Files\PostgreSQL\*\bin\`.

## Frontend on Vercel

1. Import this repository into Vercel.
2. Set framework preset to static/other if prompted.
3. Use build command:

```bash
npm run build
```

4. Set env:

```env
VITE_API_BASE_URL=https://backend-domain.com
```

`.vercelignore` excludes backend source and generated test artifacts from the frontend deployment.

## Backend on Render, Railway, or Fly.io

Deploy the `backend/` directory as a Go service.

Required env:

```env
APP_ENV=production
PORT=8080
DATABASE_URL=<production-postgres-url>
JWT_SECRET=<long-random-secret>
CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

Use platform-specific start command:

```bash
go run ./cmd/api
```

For production, prefer building a binary:

```bash
go build -o chemlab-api ./cmd/api
./chemlab-api
```

## Production PostgreSQL

Recommended providers:

- Supabase PostgreSQL
- Neon PostgreSQL
- Railway PostgreSQL

After creating the database, apply every file in `backend/migrations/` in filename order.

Catalog endpoints work with empty catalog tables by falling back to bundled seed JSON. For a stricter production setup, seed the `elements`, `substances`, and `reactions` tables and then treat PostgreSQL as the source of truth.

## API Smoke Checks

```powershell
curl http://localhost:8080/api/health
curl http://localhost:8080/api/elements
curl http://localhost:8080/api/substances
curl http://localhost:8080/api/reactions
```

Auth check:

```powershell
$body = @{ email="student@example.com"; password="password123"; name="Student" } | ConvertTo-Json
$auth = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/register -ContentType "application/json" -Body $body
$token = $auth.token
Invoke-RestMethod -Uri http://localhost:8080/api/me -Headers @{ Authorization = "Bearer $token" }
```

Teacher/admin classes, assignments, and dashboards are the next milestone and are intentionally not part of this MVP deployment.
