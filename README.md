# SIG CYA — Sistema Integrado de Gestión

Plataforma SaaS enterprise para la gestión de sistemas de calidad, ambiente y seguridad (ISO 9001, ISO 14001, ISO 45001).

## Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/dashboard` | KPIs principales y actividad reciente |
| Documentos | `/documents` | Control documental con versionado |
| Auditorías | `/audits` | Planificación y ejecución de auditorías ISO |
| Hallazgos | `/findings` | Registro y seguimiento de no conformidades |
| CAPA | `/capa` | Acciones correctivas y preventivas |
| Analytics | `/analytics` | Dashboards y métricas avanzadas |
| Reportes | `/reports` | Generación y descarga de reportes |
| Automatización | `/automation` | Workflows automáticos tipo Zapier |
| Uso | `/usage` | Consumo de recursos por período |
| Facturación | `/settings/billing` | Gestión de suscripción y plan |
| Pricing | `/pricing` | Página comercial pública |
| Checkout | `/checkout` | Flujo de alta de nuevos clientes |
| Super Admin | `/admin` | Panel de control del operador SaaS |

## Stack técnico

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS v4 + TypeScript
- **Estado**: Zustand + TanStack Query
- **UI**: Radix UI + Lucide icons
- **Base de datos**: PostgreSQL 16 (producción) / localStorage mock (demo)
- **Almacenamiento**: MinIO (compatible S3)
- **Proxy**: Nginx 1.25
- **Contenedores**: Docker + Docker Compose

## Inicio rápido (desarrollo)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Credenciales demo:
- Admin: `admin@sigcya.com` / `admin123`
- Usuario: `usuario@sigcya.com` / `user123`

## Despliegue en producción

Ver [docs/DEPLOY.md](docs/DEPLOY.md).

## Documentación

- [Instalación local](docs/INSTALL.md)
- [Guía de despliegue](docs/DEPLOY.md)
- [Arquitectura](docs/ARCHITECTURE.md)

## Licencia

Propietario — SIG CYA © 2026. Todos los derechos reservados.
