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
