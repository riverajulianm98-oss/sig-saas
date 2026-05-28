# Guía de despliegue en producción — SIG CYA

## Prerrequisitos

- Servidor Linux (Ubuntu 22.04 recomendado), mínimo 2 vCPU / 4 GB RAM
- Docker 24+ y Docker Compose v2+
- Dominio con DNS apuntando al servidor
- Certificado SSL (Let's Encrypt con Certbot)

## 1. Preparar el servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Certbot
sudo apt install certbot -y
sudo certbot certonly --standalone -d sigcya.com -d www.sigcya.com
```

## 2. Clonar el repositorio en el servidor

```bash
git clone https://github.com/tu-org/sig-saas.git /opt/sig-saas
cd /opt/sig-saas
```

## 3. Configurar variables de entorno

```bash
cp .env.production.example .env.production
nano .env.production   # Rellenar todos los CHANGE_ME
```

**Variables críticas que debes cambiar:**
- `POSTGRES_PASSWORD` — contraseña fuerte para la BD
- `JWT_SECRET` — string aleatorio de 32+ caracteres
- `NEXTAUTH_SECRET` — string aleatorio de 32+ caracteres
- `REDIS_PASSWORD` — contraseña fuerte para Redis
- `MINIO_ROOT_PASSWORD` — contraseña fuerte para MinIO
- `SMTP_PASSWORD` — API key de SendGrid o credenciales SMTP
- `NEXT_PUBLIC_APP_URL` — tu dominio real (ej. `https://sigcya.com`)

## 4. Actualizar la configuración de Nginx

Edita `docker/nginx/default.conf` y reemplaza `sigcya.com` con tu dominio real.

## 5. Construir e iniciar los servicios

```bash
cd docker
docker compose -f docker-compose.prod.yml --env-file ../.env.production up -d --build
```

## 6. Verificar el despliegue

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Estado de servicios
docker compose -f docker-compose.prod.yml ps

# Health checks
curl -f https://sigcya.com/health
```

## Actualizar a una nueva versión

```bash
cd /opt/sig-saas
git pull origin main
cd docker
docker compose -f docker-compose.prod.yml --env-file ../.env.production up -d --build frontend
```

## Mantenimiento

### Ver logs en tiempo real
```bash
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Backup manual de la base de datos
```bash
docker exec sig-saas-postgres-1 pg_dump -U sigcya sigcya | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Escalar el frontend (múltiples instancias)
```bash
docker compose -f docker-compose.prod.yml up -d --scale frontend=3
# Asegúrate de que Nginx tenga upstream balanceado configurado
```

### Renovar certificados SSL
```bash
sudo certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

## Monitorización

- Estado de servicios: `https://sigcya.com/admin/monitoring` (Super Admin)
- Backups: `https://sigcya.com/admin/backups` (Super Admin)
- Logs del sistema: `https://sigcya.com/admin/logs` (Super Admin)

## Rollback

```bash
# Listar imágenes disponibles
docker images sig-saas/frontend

# Revertir a la imagen anterior
docker tag sig-saas/frontend:previous sig-saas/frontend:latest
docker compose -f docker-compose.prod.yml up -d frontend
```
