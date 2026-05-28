# Arquitectura — SIG CYA

## Visión general

SIG CYA es un SaaS multi-tenant construido sobre Next.js 15 App Router.

```
Internet → Nginx (SSL, rate limit, cache) → Next.js 15 App Router
```

## Estructura de módulos

```
modules/<dominio>/
├── types/index.ts              # Interfaces TypeScript
├── services/<name>.service.ts  # Lógica + mock data (localStorage)
├── hooks/use-<name>.ts         # TanStack Query hooks
├── components/                 # Componentes del módulo
└── views/                      # Vistas completas (importadas por las pages)
```

## Rutas principales

| Ruta | Tipo | Descripción |
|------|------|-------------|
| /landing, /pricing, /checkout | Público | Marketing y alta |
| /(auth)/login | Auth | Login con Zustand auth store |
| /(dashboard)/* | Privado | App tenant autenticado |
| /admin/* | Super Admin | Control center con layout propio |

## Gestión de estado

- **TanStack Query** — server state, cache, mutaciones
- **Zustand** — auth, UI, impersonación de tenant
- **localStorage** — mock data demo (sin backend)

## Billing

```
Starter ($49/mo) → Professional ($149/mo) → Enterprise ($399/mo)

usePlanLimits() → LimitCheck { pct, exceeded, warning }
PlanLimitGuard  → bloquea UI cuando exceeded = true
UsageWarningBanner → avisa cuando pct >= 80%
```

## Flujo de alta

```
/pricing → /checkout?plan=X&cycle=Y
  Step 1: Confirmar plan
  Step 2: Datos empresa + admin
  Step 3: Pago mock
  Step 4: Activación → /dashboard
```

## Servicios producción

| Servicio | Tecnología | Expuesto |
|----------|------------|----------|
| Frontend | Next.js 15 | Interno :3000 |
| Proxy | Nginx 1.25 | 80/443 |
| BD | PostgreSQL 16 | Interno :5432 |
| Cache | Redis 7 | Interno :6379 |
| Storage | MinIO | Interno :9000 |
