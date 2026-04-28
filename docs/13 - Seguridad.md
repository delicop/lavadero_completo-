# Seguridad — vulnerabilidades encontradas y estado

> Última actualización: abril 2026
> Auditoría realizada sobre el código fuente completo (backend NestJS + frontend Angular).

---

## Resumen

| Nivel | Total | Resueltas | Pendientes |
|-------|------:|----------:|----------:|
| CRITICA | 4 | 4 | 0 |
| ALTA | 5 | 5 | 0 |
| MEDIA | 6 | 6 | 0 |
| BAJA | 3 | 2 | 1 |

---

## CRITICAS

### ~~C1. CORS sin restricciones~~ ✅ RESUELTO
**Archivo:** `backend/src/main.ts`
`app.enableCors()` sin argumentos permite cualquier origen.
**Fix:** CORS restringido a origen configurado por variable de entorno `ALLOWED_ORIGINS`.

---

### ~~C2. Sin headers de seguridad HTTP~~ ✅ RESUELTO
**Archivo:** `backend/src/main.ts`
Sin Helmet, el servidor no enviaba `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.
**Fix:** `helmet()` instalado y aplicado globalmente.

---

### ~~C3. XSS con `innerHTML` en el toast de WhatsApp~~ ✅ RESUELTO
**Archivo:** `frontangular/src/app/shared/utils/whatsapp.ts`
Se interpolaban `titulo` y `mensaje` (que pueden contener datos del cliente) directamente en `innerHTML`.
**Fix:** Refactorizado a `createElement` + `textContent` para las partes dinámicas.

---

### C4. JWT_SECRET débil en `.env`
**Archivo:** `backend/.env` (local, no commiteado) / variable de entorno en producción
El valor por defecto `cambia_este_secreto_en_produccion` es predecible.
Si un atacante conoce el secret puede forjar tokens JWT y entrar como cualquier usuario.

**Pasos para el servidor de producción (Oracle Cloud):**

```bash
# 1. Conectarse por SSH
ssh ubuntu@<IP_SERVIDOR>

# 2. Generar un secret fuerte
openssl rand -base64 48

# 3. Editar las variables de entorno del contenedor backend
#    (o el archivo .env del servidor — depende de cómo está deployado)
#    Buscar JWT_SECRET y reemplazar con el valor generado en el paso 2

# 4. Reiniciar el backend para que tome el nuevo secret
docker compose restart backend
# o: pm2 restart backend

# 5. Verificar que el servicio levantó correctamente
docker compose logs backend --tail=20
```

> Importante: al rotar el secret, **todos los tokens existentes quedan inválidos**.
> Todos los usuarios van a necesitar hacer login de nuevo. Hacerlo en horario de baja actividad.

**Estado:** ✅ RESUELTO — secret rotado el 27/04/2026. Variable actualizada en `docker-compose.prod.yml` del servidor. También se agregó `ALLOWED_ORIGINS` para restringir el CORS en producción.

---

## ALTAS

### ~~A1. Sin límite en el cuerpo de requests~~ ✅ RESUELTO
**Archivo:** `backend/src/main.ts`
Sin límite de tamaño un atacante puede enviar payloads gigantes para agotar memoria.
**Fix:** Límite de 100kb aplicado en Express.

---

### ~~A2. Parámetro `limit` sin tope máximo~~ ✅ RESUELTO
**Archivo:** `backend/src/modules/auth/auth.controller.ts`
`?limit=999999999` podría traer millones de registros.
**Fix:** Tope de 500 aplicado con `Math.min`.

---

### ~~A3. Complejidad de contraseña mínima~~ ✅ RESUELTO
**Archivos:** DTOs de `auth` y `usuarios`
Solo se validaba `MinLength(8)`. Se permitían passwords como `12345678` o `password`.
**Fix:** Agregado `@Matches` con regex que exige mayúscula, minúscula, número y símbolo.
Aplica a: `registrar-tenant.dto.ts`, `crear-usuario.dto.ts`, `cambiar-password.dto.ts`.

---

### ~~A4. Decodificación JWT sin try/catch en el frontend~~ ✅ YA TENÍA FIX
**Archivo:** `frontangular/src/app/core/services/auth.service.ts`
Ya tenía `try/catch` correctamente implementado. No requirió cambios.

---

### ~~A5. Sin rate limiting en endpoints de autenticación~~ ✅ RESUELTO
**Archivo:** `backend/src/modules/auth/auth.controller.ts`
El endpoint `/api/auth/login` no tenía límite de intentos. Permite brute force de passwords.
**Fix:** `@nestjs/throttler` instalado. Guard global en `AppModule` (60 req/min por IP).
Límites específicos en auth: login → 10 intentos/min, registrar → 5 intentos/hora.

---

## MEDIAS

### ~~M1. Stack trace expuesto en errores de producción~~ ✅ RESUELTO
**Archivo:** `backend/src/common/filters/all-exceptions.filter.ts`
El stack trace se enviaba en la respuesta siempre, exponiendo rutas internas y versiones.
**Fix:** Stack solo se incluye cuando `NODE_ENV !== 'production'`.

---

### ~~M2. Token JWT guardado en `localStorage`~~ ✅ RESUELTO
**Archivos:** `auth.service.ts`, `auth.interceptor.ts`, `auth.guard.ts` (frontend) + `auth.controller.ts`, `jwt.strategy.ts` (backend)
**Fix:** JWT migrado a cookie `httpOnly; SameSite=Strict`. El token ya no toca `localStorage`.
- Backend: `cookie-parser` instalado, `jwt.strategy.ts` extrae token de cookie (fallback a Bearer para la app móvil), `auth.controller.ts` emite la cookie en login/registro y la borra en `POST /auth/logout`.
- Frontend: el interceptor envía `withCredentials: true` (el browser envía la cookie automáticamente), ya no inyecta `Authorization` header. El guard y `estaAutenticado()` usan `isLoggedIn` (flag no sensible en localStorage). `getRolDelToken()` lee el `rol` del localStorage.

---

### ~~M3. Sin CSRF protection~~ ✅ RESUELTO por M2
Con `SameSite=Strict`, el browser no envía la cookie en requests originados desde otros dominios. CSRF queda cubierto sin token extra.

---

### ~~M4. Validación de fechas en query params~~ ✅ RESUELTO
**Archivos:** `turnos.controller.ts`, `facturacion.controller.ts`, `reportes.controller.ts`
Fechas de query string usadas en `new Date(fechaDesde)` sin validar formato.
**Fix:** Pipe `FechaFiltroPipe` en `common/pipes/` que valida formato `YYYY-MM-DD` y lanza `400` si es inválido. Aplicado con `@Query('fechaDesde', FechaFiltroPipe)` en los tres controladores. `reportes.controller.ts` tenía el regex inline — reemplazado por el pipe.

---

## BAJAS

### ~~B1. Passwords impresas en consola durante el seed~~ ✅ RESUELTO
**Archivo:** `backend/src/database/seed.ts`
Las contraseñas `Admin1234` y `Super1234` aparecían en `console.log`.
**Fix:** Reemplazados por un aviso genérico de cambiar contraseña.

---

### B2. Sin versionado de API
**Impacto:** Cambios breaking en la API no se pueden gestionar gradualmente.
**Fix pendiente:** Agregar prefijo `/api/v1/` cuando se defina estrategia de versioning.
Bajo impacto mientras sea un producto monocliente/interno.

---

### ~~B3. Credenciales hardcodeadas en seed (valores por defecto)~~ ✅ RESUELTO
**Archivo:** `backend/src/database/seed.ts`
**Fix:** El seed ahora lee credenciales de variables de entorno con fallback a valores de desarrollo:
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
- `SEED_SUPERADMIN_EMAIL`, `SEED_SUPERADMIN_PASSWORD`
En producción se pasan las vars antes de correr el seed:
```bash
SEED_ADMIN_EMAIL=real@email.com SEED_ADMIN_PASSWORD=MiPassword1! npm run seed
```
Los defaults de desarrollo también se actualizaron a `Admin1234!` / `Super1234!` (cumplen la nueva política de complejidad).

---

## Lo que ya estaba bien

- Bcrypt para hashing de passwords (cost factor 10)
- JWT validado en el backend en cada request
- Aislamiento multi-tenant por `tenantId` en todas las queries
- UUID como primary keys (no IDs secuenciales predecibles)
- `ValidationPipe` global con `whitelist: true` y `forbidNonWhitelisted: true`
- Queries TypeORM parametrizadas (sin inyección SQL)
- Control de roles con guards en todos los endpoints protegidos
- `bcrypt.compare` para comparación de passwords (timing-safe)
- `.env` en `.gitignore`, no se commitea

---

## Orden de implementación de los pendientes

```
1. C4 — Rotar JWT_SECRET en producción (5 min, acción en servidor)
2. A5 — Rate limiting en login (instalar throttler + configurar)
3. M4 — Validar fechas en query params
4. M2 + M3 — Migrar tokens a httpOnly cookies (más complejo, hacerlo junto)
5. B2 — Versionado de API (cuando se planee primer breaking change)
6. B3 — Seed con credenciales por variable de entorno (antes de lanzar SaaS)
```
