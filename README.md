# Full Shop Monolito — Guía de Ejecución

## 📦 Stack
- **NestJS 11**
- **Prisma 6 + PostgreSQL**
- **Docker Compose**
- **Swagger (con Basic Auth)**

---

## ✅ Requisitos
- **Docker Desktop** (recomendado)
- **Node.js 20+** y **npm 10+** (solo si vas a correrlo en local, sin Docker para la app)

---

## 🔧 Variables de entorno

Crea un archivo **`.env`** en la raíz del proyecto con este contenido base (ajusta tus valores reales):

```dotenv
# ========== App / Server ==========
PORT=3000
NODE_ENV=development

# ========== Seguridad ==========
# Generá uno propio, largo y aleatorio
# (ej: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_SECRET=poné_un_secreto_largo_unico

SWAGGER_PATH=/api/docs
SWAGGER_PASSWORD=poné_una_password_fuerte

# ========== Google OAuth (opcional) ==========
PASSWORD_GOOGLE_GENERIC=laContraseñam4sseguradelmundo@
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/signin/callback

# ========== Storage (opcional) ==========
# Si no usás Vercel Blob, dejalo vacío
BLOB_READ_WRITE_TOKEN=

# ========== Base de datos ==========
# Para Docker (la app se conecta al servicio 'db' del compose)
DATABASE_URL=postgresql://postgres:postgres@db:5432/fullshop?schema=public

# Si corrés la app fuera de Docker contra la DB del contenedor mapeada en 5433,
# comentá la línea de arriba y descomentá esta:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/fullshop?schema=public
```
---

## 🐳 Modo Docker (recomendado)

1. **Levantar servicios**
   ```bash
   docker compose up -d --build
   # Logs
   docker compose logs -f app
   ```

2. **Comprobaciones**
   - API: `http://localhost:3000/`
   - Swagger: `http://localhost:3000/api/docs`  
     - Usuario: `admin`
     - Password: valor de `SWAGGER_PASSWORD`
   - La app aplica `prisma migrate deploy` automáticamente al arrancar.

3. **Comandos útiles**
   ```bash
   # Estado de los contenedores
   docker compose ps

   # Logs de db
   docker compose logs -f db

   # Shell dentro del contenedor de la app
   docker compose exec app sh

   # Probar conexión a la DB desde el contenedor
   docker compose exec db pg_isready -U postgres -d fullshop
   ```

> **Nota de puertos:** si el puerto 5432 del host está ocupado y querés conectarte desde tu PC a la DB, en `docker-compose.yml` podés mapear `5433:5432` para la DB. La app dentro de Docker sigue usando `db:5432`.

---

## 💻 Modo Local (app fuera de Docker, DB en Docker)

1. **Exponer DB en otro puerto del host (p. ej. 5433)**  
   En `docker-compose.yml`:
   ```yaml
   services:
     db:
       image: postgres:16
       ports:
         - "5433:5432"  # host 5433 -> container 5432
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: fullshop
       # ... resto igual
   ```

   Levantá solo la DB:
   ```bash
   docker compose up -d db
   docker compose logs -f db
   ```

2. **Ajustar `.env` local**
   ```dotenv
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/fullshop?schema=public
   ```

3. **Instalación y arranque**
   ```bash
   npm ci
   npx prisma generate
   npx prisma migrate dev    # o migrate deploy si ya tenés migraciones
   npm run start:dev
   ```

4. **Rutas**
   - API: `http://localhost:3000/`
   - Swagger: `http://localhost:3000/api/docs`

---

## 🗃️ Prisma (comandos frecuentes)
```bash
# Generar cliente
npx prisma generate

# Migraciones en desarrollo
npx prisma migrate dev

# Aplicar migraciones (producción)
npx prisma migrate deploy

# (opcional) Prisma Studio
npx prisma studio
```

---

## 🧪 Scripts útiles
```bash
# Compilar
npm run build

# Iniciar (prod, usa dist/)
npm run start:prod

# Linter
npm run lint

# Tests
npm run test
```

---

## 📚 Swagger / Auth
- UI Swagger protegida con **Basic Auth**:
  - user: `admin`
  - pass: valor de `SWAGGER_PASSWORD` en el `.env`
- Endpoints protegidos usan **Bearer JWT** (`Authorization: Bearer <token>`).

---

## 🛠️ Troubleshooting

- **`Can't reach database server at db:5432`**  
  Estás corriendo la app **local** con URL de Docker.  
  - App en Docker ⇒ `db:5432`  
  - App local ⇒ `localhost:5433` (si mapeaste `5433:5432`) o `localhost:5432` si expusiste así.

- **`port is already allocated` al levantar la DB**  
  Ya hay algo en `5432`.  
  - O quitá el mapeo `ports:` de `db`  
  - O mapeá `5433:5432` en `docker-compose.yml`.

- **Docker Desktop error (engine apagado)**  
  Abrí **Docker Desktop** y esperá “Docker Desktop is running”.  
  Verificá con: `docker version` / `docker info`.

- **Swagger en otra ruta**  
  Cambiá `SWAGGER_PATH` en `.env` (p. ej., `/api/documentacion`) y reiniciá.

---

## 🏭 Producción (resumen rápido)
- Usá Postgres gestionado (Neon/Railway/Supabase) y poné:
  ```dotenv
  DATABASE_URL=postgresql://USER:PASSWORD@HOST:PUERTO/DB?sslmode=require&schema=public
  ```
- Cambiá `GOOGLE_CALLBACK_URL` a tu dominio público.
- Poné un `JWT_SECRET` fuerte **distinto** al de desarrollo.
- Serví detrás de un reverse proxy (Nginx/Caddy) con HTTPS.
