# Voice Lab API

## Run locally

From the `server` directory, create and activate a virtual environment, then install dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the development server:

```powershell
python -m uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. Interactive docs are at
`http://localhost:8000/docs`, and the health check is `http://localhost:8000/health`.

The frontend's local development origin (`http://localhost:3000`) is allowed by CORS.
After starting the API, generate TypeScript types from its OpenAPI schema from the
`client` directory with `npm run api:generate`.

## Bedrock text-generation test

The authenticated `POST /text-generation/answer` endpoint accepts a prompt and returns
an answer from the configured Bedrock model. The AWS identity used by boto3 must be
allowed to invoke that model, and model access must be enabled in the configured region.
For example:

```powershell
curl.exe -X POST http://localhost:8000/text-generation/answer `
  -H "Authorization: Bearer <neon-auth-access-token>" `
  -H "Content-Type: application/json" `
  -d '{ "prompt": "Explain what a voice generation is in one sentence." }'
```

To compile the service module and create its bytecode cache, run this from `server`:

```powershell
python -m py_compile app\services\text_generation_service.py
```

## Database migrations

The `voices` and `generations` tables are managed with Alembic. Install the updated
dependencies, then run migrations from this `server` directory:

```powershell
python -m pip install -r requirements.txt
python -m alembic upgrade head
```

Set `DATABASE_URL_UNPOOLED` to Neon's direct (non-pooler) connection URL for migrations.
If it is not set, Alembic uses `DATABASE_URL` and rejects pooled Neon URLs. To generate a
new migration after changing models:

```powershell
python -m alembic revision --autogenerate -m "describe the schema change"
```

## Neon

Run `neon deploy` from the repository root after signing in with `neon login`.
Neon writes the database and Auth URLs to the root `.env.local`. The API reads
its existing `server/.env` first, then the root `.env.local`, so the deployed
Neon database URL takes precedence without replacing the other local settings.

The Next.js app reads `client/.env.local`. It needs `NEON_AUTH_BASE_URL`,
`NEON_AUTH_COOKIE_SECRET` (at least 32 characters), and `NEXT_PUBLIC_API_URL`.
Keep these files local; they contain credentials and are git-ignored. Run the
client from `client` with `npm run dev`. The studio requires a Neon Auth session
and verifies the session token against the FastAPI API.


<!-- python -m py_compile app\services\text_generation_service.py -->