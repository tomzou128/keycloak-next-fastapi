# Project Guide

This is a project consists of a FastAPI backend and a Next.js frontend with Keycloak authentication and PostgreSQL
database.

## Development Setup

### Environment Files

1. Create the following environment files:
    - `/next-frontend/.env.development` - Frontend environment variables
    - `/fastapi-frontend/.env.development` - Backend environment variables
    - `init.sql` - PostgreSQL users and databases
    - `.env.keycloak.dev` - Keycloak environment variables
    - `/realm-exports` - Keycloak configuration (Optional)

### Running Development Environment

#### Option 1: Full Docker Development Environment

```bash
# Start all services (backend, frontend, database, keycloak)
docker-compose -f docker-compose.dev.yml up --build
```

Access services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Keycloak: http://localhost:8090

#### Option 2: Local Development with Supporting Services

```bash
# Start only supporting services (database, keycloak)
docker-compose -f docker-compose.dev.yml up -d database keycloak

# Run backend locally
cd /path/to/project
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Run frontend locally
cd next-frontend
npm install
npm run dev
```

## Production Build

(working)
