# Instalación local — SIG CYA

## Requisitos

- Node.js 20+
- npm 10+
- Git

## Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/sig-saas.git
cd sig-saas

# 2. Instalar dependencias (desde la raíz — monorepo)
npm install

# 3. Variables de entorno
cp .env.production.example frontend/.env.local
# Edita frontend/.env.local con tus valores de desarrollo:
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# NEXT_PUBLIC_API_URL=http://localhost:3000

# 4. Iniciar el servidor de desarrollo
cd frontend
npm run dev
```

Visita `http://localhost:3000`.

## Cuentas demo precargadas

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | admin@sigcya.com | admin123 |
| Admin empresa | gerente@acero.com | demo123 |
| Usuario | usuario@sigcya.com | user123 |

## Datos de prueba

Al iniciar la app por primera vez, el localStorage se inicializa automáticamente con:
- 5 empresas demo
- 10 workflows de automatización
- Documentos, auditorías, hallazgos y CAPA de ejemplo
- Suscripción Professional activa (simula plan de pago)

Para resetear todos los datos: `Super Admin → Configuración → Zona de peligro → Resetear datos`.

## Herramientas de desarrollo

```bash
# Lint
npm run lint

# Build de producción local
npm run build && npm start

# Type check
npx tsc --noEmit
```
