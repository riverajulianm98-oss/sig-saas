# SIG SaaS — Backend

API empresarial multi-tenant para Sistemas Integrados de Gestión (SIG).

## Stack

- **FastAPI** — API REST
- **PostgreSQL** — Base de datos
- **SQLAlchemy 2.x** — ORM
- **Alembic** — Migraciones
- **Clean Architecture** — Capas domain / application / infrastructure / api

## Estructura

```
backend/
├── alembic/              # Migraciones
├── app/
│   ├── api/              # Presentación (routers HTTP)
│   ├── application/      # Casos de uso
│   ├── core/             # Config, logging
│   ├── db/               # Engine, sesión, Base
│   ├── domain/           # Lógica de dominio (sin FastAPI/SQLAlchemy)
│   ├── infrastructure/   # ORM, adaptadores externos
│   ├── middleware/       # Tenant, etc.
│   ├── modules/          # Módulos de negocio (bounded contexts)
│   ├── repositories/     # Interfaces de repositorio
│   ├── schemas/          # DTOs Pydantic
│   └── main.py           # Entrypoint FastAPI
├── .env.example
└── requirements.txt
```

## Inicio rápido

### 1. Base de datos

```bash
cd docker
docker compose up -d
```

### 2. Entorno Python

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env
```

### 3. Migraciones

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 4. Servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

## Multi-tenant

Enviar header `X-Tenant-ID` con UUID de empresa en rutas protegidas, **o** usar JWT (el middleware extrae `tenant_id` del token).

Modelos tenant-scoped deben usar `TenantScopedMixin` y filtrar por contexto en repositorios.

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Registro empresa + admin |
| POST | `/api/v1/auth/login` | Login → JWT |
| GET | `/api/v1/auth/me` | Perfil (Bearer token) |

Ejemplo registro:

```json
{
  "tenant": { "company_name": "Mi Empresa SAS", "tax_id": "900123456" },
  "admin": { "email": "admin@empresa.com", "password": "Secret123!", "full_name": "Juan Pérez" }
}
```

## Tests

```bash
pytest app/tests -v
```
