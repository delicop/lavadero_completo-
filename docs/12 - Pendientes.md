# Pendientes — lo que falta construir

> Última actualización: abril 2026

---

## Para arrancar — en este orden

Lista limpia de qué hacer primero. Cada punto tiene su sección detallada más abajo.

### Hoy (producción en riesgo)

- [ ] **Pool DB** `max: 10` → `max: 30` en `backend/src/app.module.ts` — 5 min
- [ ] **pm2 cluster** en el servidor: `pm2 start dist/main.js -i max` — 10 min
- [ ] **Credenciales BD** fuera de `docker-compose.prod.yml` — usar `${POSTGRES_PASSWORD}` — 10 min
- [ ] **Backup diario** — script `pg_dump` + cron en el servidor — 30 min
- [ ] **WebSocket** — autenticación + rooms por tenant en `events.gateway.ts` — 2h

### Esta semana (seguridad y calidad)

- [ ] **`adminGuard`** en Angular — proteger rutas `/clientes`, `/servicios`, `/personal`, `/liquidaciones`, `/configuracion-negocio` — 1h
- [ ] **`TenantGuard`** en backend — validación central de tenantId — 1h
- [ ] **Interceptor de timeout** (15s) en backend — 30 min
- [ ] **Página 404** en Angular (ruta `**` actualmente redirige al dashboard) — 30 min
- [ ] **`.env.example`** sincronizar con variables reales — 15 min
- [ ] **Migraciones TypeORM** — crear `data-source.ts` y primer migration — 2h

### Cuando arranques features nuevas

- [ ] **GitHub Actions CI** mínimo — build + typecheck en cada push — 1h
- [ ] **Flutter signing** para release (Play Store) — 1-2h
- [ ] **Flutter URL configurable** via `--dart-define` (hoy tiene IP hardcodeada) — 30 min
- [ ] **Redis + caché** para sesiones y config de tenant — 3h

### Producto base (features)

- [ ] **A.** Reorganizar sidebar + ocultar placeholders
- [ ] **B.** Módulo Trabajos
- [ ] **C.** Cotizaciones
- [ ] **D.** Gastos con categorías
- [ ] **G.** Permisos por Rol
- [ ] **H.** Recuperar contraseña + email transaccional

---

## Producto base — corto plazo

Lo siguiente completa el sistema operativo del lavadero antes de pensar en monetización.
El orden es el orden recomendado de implementación.

---

### A. Reorganizar el sidebar

Cambiar de 2 grupos a 3, siguiendo la estructura de referencia visual:

| Grupo | Rutas |
|-------|-------|
| **Operación** | Dashboard, Trabajos, Turnos, Cotizaciones, Clientes, Vehículos |
| **Gestión** | Servicios, Pagos (Facturación), Caja, Gastos |
| **Administración** | Personal, Liquidaciones, Asistencia, Reportes, Configuración, Permisos, Mi Perfil |

- No se cambian colores ni diseño visual, solo la agrupación lógica
- Archivo a editar: `frontangular/src/app/layout/layout.component.ts`

---

### B. Módulo "Trabajos"

El sistema actual tiene "Turnos" como unidad central. Se necesita un módulo **Trabajos** más completo

**Vista lista (`/trabajos`):**
- 4 tarjetas: Pendientes / En progreso / Completados / Total cobrado
- Filtros: Hoy / Esta semana / Este mes / Personalizado
- Dropdown de estado
- Buscador por cliente o patente
- Tabla: Cliente, Vehículo, Servicios, Total, Pago, Estado, Acciones

**Modal "Crear trabajo":**
- Buscador de cliente por nombre o teléfono + link "+ Crear cliente"
- Selector de vehículo (carga al elegir cliente)
- Aviso si no hay servicios creados (con link a `/servicios`)
- Tabla de ítems: Servicio, Precio unit., Cant., Total + eliminar
- Botón "+ Ítem personalizado"
- Notas (opcional)
- Descuento ($) + Motivo del descuento
- Resumen: Subtotal / Total
- Checkbox **"Cobrar ahora"** — registra el pago al crear
- Botones: Cancelar / Crear trabajo

**Backend necesario:**
- Entidad `Trabajo` (o ampliar `Turno`) con ítems, descuento, estadoPago
- Endpoint `POST /api/trabajos` y `GET /api/trabajos` con filtros

---

### C. Cotizaciones (`/cotizaciones`)

Presupuesto que se genera antes de cobrar, puede enviarse por WhatsApp.

**Modal "Nueva cotización":**
- Buscador de cliente + link "+ Crear cliente"
- Selector de vehículo
- Selector de servicios del catálogo (multi-selección)
- Botón "+ Ítem personalizado"
- Notas (opcional)
- Campo "Válido hasta" (fecha de vencimiento)
- Descuento ($) + Motivo del descuento
- Resumen: Subtotal / Total
- Botones: Cancelar / Crear cotización

**Diferencia con Trabajos:** la cotización no cambia estado operativo ni genera cobro.

**Backend necesario:**
- Entidad `Cotizacion` con ítems, fechaVencimiento, estadoCotizacion
- Endpoints CRUD `/api/cotizaciones`

---

### D. Gastos (`/gastos`)

Historial centralizado de todos los gastos de todas las cajas, con categorías.

- Navegación mes a mes (← Abril 2026 →)
- Filtro por categoría (chips): Todas + categorías configuradas
- Tarjeta "Total del mes"
- Tabla: Fecha, Concepto, Categoría, Monto, Caja
- Botón "+ Registrar gasto"
- Botón "Gestionar categorías" → modal para CRUD de categorías

**Backend necesario:**
- Agregar campo `categoria` a `GastoCaja` (o tabla `CategoriaGasto`)
- Endpoint `GET /api/gastos` con filtros de fecha y categoría

---

### ~~E. Modal "Crear cliente" mejorado~~ ✅ IMPLEMENTADO

El flujo de creación de clientes y vehículos fue rediseñado:

- Modal "Crear cliente": Nombre, Apellido, Email, Teléfono, Cédula (sin vehículo — se separa el paso)
- Desde "Nueva orden" (Turnos y Dashboard): dropdown de Cliente con opción `➕ Crear cliente nuevo...` que abre un modal inline
- Desde "Nueva orden": dropdown de Vehículo con opción `➕ Crear vehículo nuevo...` que abre un modal inline (solo Placa y Color son obligatorios)
- Búsqueda por placa en la nueva orden: auto-rellena cliente + vehículo si la placa existe
- El frontend hace dos llamadas separadas: primero crea el cliente, luego crea el vehículo con el `clienteId` retornado

---

### ~~F. Reportes (`/reportes`)~~ ✅ IMPLEMENTADO

- Endpoint `GET /api/reportes?desde=&hasta=` — devuelve métricas, ingresos diarios, distribución de servicios, tendencia y P&L
- Página con selector de período (semana / mes / personalizado)
- 4 tarjetas: ingresos, trabajos, ganancia neta, clientes nuevos
- Tabs: Ingresos (barras + distribución), Servicios (ranking), Tendencia (actual vs anterior), P&L

---

### G. Permisos por Rol (`/permisos`)

El admin configura qué secciones puede ver/usar cada rol.

- Columnas: **Supervisor** y **Empleado** (expandible a más roles)
- Una fila por sección: Dashboard, Trabajos, Turnos, Cotizaciones, Clientes, Vehículos, Servicios, Pagos, Caja, Gastos, Personal, Reportes, Configuración
- Toggle on/off por celda
- Las secciones apagadas no aparecen en el sidebar del usuario con ese rol

**Backend necesario:**
- Tabla `permisos_rol`: `tenantId`, `rol`, `seccion`, `habilitado`
- Endpoints `GET/PUT /api/permisos`
- El `sesionResolver` debe cargar los permisos del rol y exponerlos para que el sidebar filtre

---

## Refactorización — código duplicado

Auditoría realizada en abril 2026. Se identificaron **16 patrones duplicados** en backend, frontend y Flutter que eliminan ~300 líneas de código si se unifican.

---

### R1. `buscarPorId + NotFoundException` — repetido en 8 servicios del backend

**Archivos:**
`clientes.service.ts`, `vehiculos.service.ts`, `servicios.service.ts`, `usuarios.service.ts`, `facturacion.service.ts`, `liquidaciones.service.ts`, `turnos.service.ts`, `logs.service.ts`

**Patrón repetido en cada uno:**
```typescript
const entity = await this.repo.findOne({ where: { id, tenantId } });
if (!entity) throw new NotFoundException(`... no encontrado`);
return entity;
```

**Solución:** Crear `backend/src/common/services/base-crud.service.ts` con método `buscarPorIdOFallar(id, tenantId)`.

---

### R2. Validación de campo único (`ConflictException`) — repetida en 4 servicios

**Archivos:** `clientes.service.ts` (email), `vehiculos.service.ts` (placa), `servicios.service.ts` (nombre), `usuarios.service.ts` (email)

**Solución:** Crear `backend/src/common/helpers/unique-validator.ts` con función `validateUniqueField(repo, field, value, tenantId, errorMessage)`.

---

### R3. Filtrado por rango de fechas (`Between`) — repetido en 4 servicios

**Archivos:** `turnos.service.ts` (2 métodos), `facturacion.service.ts`, `reportes.service.ts`, `liquidaciones.service.ts`

**Patrón repetido:**
```typescript
const offset = await this.tenantsService.offsetParaTenant(tenantId);
where['fechaHora'] = Between(
  new Date(`${fechaDesde}T00:00:00${offset}`),
  new Date(`${fechaHasta}T23:59:59${offset}`),
);
```

**Solución:** Crear `backend/src/common/helpers/date.helper.ts` con función `buildDateRangeWhere(fechaDesde, fechaHasta, offset, field?)`.

---

### R4. Servicios CRUD de Angular — 6 servicios con estructura idéntica

**Archivos:** `cliente.service.ts`, `vehiculo.service.ts`, `turno.service.ts`, `servicio.service.ts`, `usuario.service.ts`, `caja.service.ts`

Todos implementan `listar()`, `buscarPorId()`, `crear()`, `actualizar()`, `eliminar()` con `firstValueFrom(this.http.get/post/patch/delete(...))`.

**Solución:** Crear `frontangular/src/app/shared/services/base-crud.service.ts` genérico. Cada servicio extiende pasando el endpoint y tipo.

---

### R5. Lógica de modal (abrir/cerrar/guardar) — repetida en 7 componentes Angular

**Archivos:** `clientes.component.ts`, `vehiculos.component.ts`, `servicios.component.ts`, `liquidaciones.component.ts`, `turnos.component.ts`, `configuracion.component.ts`, `dashboard.component.ts`

Cada uno implementa `abrirNuevo()`, `abrirEditar(item)`, `cerrarForm()`, `guardar()` con el mismo flujo try/catch.

**Solución:** Crear `frontangular/src/app/shared/utils/form-helpers.ts` con funciones `abrirNuevo`, `abrirEditar`, `handleGuardar(esEdicion, crear, actualizar, onSuccess)`.

---

### R6. Confirmación de eliminación — repetida en 6 componentes Angular

**Archivos:** `clientes.component.ts`, `vehiculos.component.ts`, `servicios.component.ts`, `liquidaciones.component.ts`, `turnos.component.ts`, `configuracion.component.ts`

```typescript
async eliminar(id: string) {
  if (!confirm('¿Eliminar este ...?')) return;
  await this.svc.eliminar(id);
  await this.cargar();
}
```

**Solución:** Agregar `confirmarEliminar(nombre, onConfirm, onSuccess)` a `frontangular/src/app/shared/utils/confirm.ts` (el archivo ya existe para el fix de XSS de WhatsApp, extender con esta utilidad).

---

### R7. Patrón de carga en Providers Flutter — repetido en 3 providers

**Archivos:** `clientes_provider.dart`, `servicios_provider.dart`, `turnos_provider.dart`

Todos implementan el mismo patrón `loading=true → fetch → loading=false → notifyListeners` con manejo de error.

**Solución:** Crear `applavadero/lib/core/providers/base_provider.dart` con clase abstracta `BaseProvider<T>` que implemente `cargar()` genérico.

---

### R8. Patrón `initState` inconsistente en screens Flutter

**Archivos:** `clientes_screen.dart`, `servicios_screen.dart`, `turnos_screen.dart`, `dashboard_screen.dart`, `mis_turnos_screen.dart`

Algunos usan `Future.microtask`, otros `WidgetsBinding.instance.addPostFrameCallback`. Comportamiento diferente.

**Solución:** Estandarizar todos a `Future.microtask(() => context.read<Provider>().cargar())`.

---

### R9. Diálogo de confirmación Flutter — repetido en cada screen que elimina

**Archivos:** `servicios_screen.dart` y cualquier screen futura con eliminación.

**Solución:** Crear `applavadero/lib/shared/widgets/confirm_dialog.dart` con función `showConfirmDialog(context, title, content)`.


> **Prioridad recomendada:** R3 primero (riesgo de zona horaria en producción), luego R4+R5 juntos (mayor impacto en Angular), luego R1+R2 en backend.

---

## Guards y Middleware faltantes

### Backend — lo que existe vs. lo que falta

**Existe y funciona:**
- `JwtAuthGuard` — extrae JWT de cookie con fallback a Bearer header
- `RolesGuard` — valida rol en endpoints protegidos con `@Roles()`
- `ThrottlerGuard` — global 60 req/min, sobrescrito en login (10/min) y registro (5/hora)
- `AllExceptionsFilter` — global, loguea 500+ en BD, oculta stack trace en producción
- `ValidationPipe` — global con `whitelist: true` y `forbidNonWhitelisted: true`
- Helmet, CORS con `ALLOWED_ORIGINS`, `cookieParser`, body limit 100kb

**Falta:**

**Guard de tenant isolation (`TenantGuard`)**
Hoy cada servicio filtra manualmente por `tenantId`. Si algún método nuevo olvida el filtro, datos de un tenant se ven en otro. Un guard central que verifique en el request que `usuario.tenantId` existe (y sea válido) antes de llegar al controlador haría esto imposible de olvidar.
- Crear: `backend/src/common/guards/tenant.guard.ts`
- Aplicar globalmente junto a `JwtAuthGuard`

**Interceptor de timeout**
Ningún endpoint tiene timeout. Una query lenta puede dejar el event loop bloqueado indefinidamente.
- Crear: `backend/src/common/interceptors/timeout.interceptor.ts`
- Valor razonable: 15 segundos
- Registrar globalmente en `APP_INTERCEPTOR`

**Interceptor de logging de requests**
No hay registro de qué endpoints se llaman, con qué latencia ni qué usuario los hace. Imposible depurar problemas en producción sin esto.
- Crear: `backend/src/common/interceptors/logging.interceptor.ts`
- Loguear: método, ruta, `usuarioId`, `tenantId`, duración, status code
- Solo en `NODE_ENV === 'production'` o controlado por variable

### Frontend Angular — guard de rol faltante

Existe `authGuard` (login) y `superadminGuard`. Pero no hay guard que separe rutas de admin vs. trabajador. Un trabajador autenticado puede navegar manualmente a `/clientes`, `/servicios`, `/personal`, `/liquidaciones`, `/configuracion`.

Rutas que deberían bloquearse para el rol `trabajador`:

| Ruta | Debe ser solo-admin |
|------|---------------------|
| `/clientes` | ✓ |
| `/servicios` | ✓ |
| `/configuracion` (Personal) | ✓ |
| `/liquidaciones` | ✓ |
| `/configuracion-negocio` | ✓ |
| `/reportes` | ✓ |

**Solución:** Crear `frontangular/src/app/core/guards/admin.guard.ts` que lea el rol desde `SesionService` y redirija a `/dashboard` si el rol es `trabajador`. Aplicar en `app.routes.ts` en las rutas listadas.

---

## Capacidad del servidor — 200 usuarios concurrentes

**Veredicto: el servidor actual NO soporta 200 usuarios simultáneos con la configuración presente.**

### Cuello de botella 1: pool de conexiones PostgreSQL — CRÍTICO

`app.module.ts` tiene `extra: { max: 10 }`. Con 200 usuarios generando requests simultáneos, los primeros 10 se atienden y los demás esperan en cola. Latencia esperada >5s.

**Fix:** Cambiar a `max: 30` en `app.module.ts`. Con una instancia mediana de Oracle (4GB RAM, 2 vCPU), PostgreSQL puede manejar 50-100 conexiones sin problema.

### Cuello de botella 2: Node.js single process — ALTO

El backend corre en un solo proceso. Aunque Node.js es async, las operaciones CPU-intensivas (bcrypt en login, generación de JWT) bloquean el event loop.

**Fix:** Usar `pm2` en modo cluster en el servidor de producción:
```bash
pm2 start dist/main.js -i max --name lavadero-api
```
Esto crea un proceso por vCPU y multiplica el throughput.

### Cuello de botella 3: sin caché — MEDIO

Cada request de `/api/auth/me`, listados de servicios, configuración del tenant hace una query a la BD. Con 200 usuarios activos esto se repite constantemente para datos que casi nunca cambian.

**Fix a corto plazo:** Cachear en memoria (Map con TTL) la configuración de cada tenant. No requiere Redis.
**Fix a largo plazo:** Agregar Redis al `docker-compose.prod.yml` y usar `@nestjs/cache-manager` para cachear `GET /api/servicios`, `GET /api/auth/me`, config del tenant.

### Cuello de botella 4: specs de instancia no documentadas — BLOQUEANTE

No se sabe cuánta RAM ni cuántos vCPU tiene la instancia Oracle Cloud. Sin eso no se puede planificar nada.

**Acción inmediata:** conectarse al servidor y ejecutar:
```bash
free -h && lscpu && df -h
```
Luego documentar los valores en `docs/11 - Administración del servidor.md`.

### Resumen de cambios para llegar a 200 usuarios

| Cambio | Archivo | Esfuerzo | Impacto |
|--------|---------|---------|---------|
| Pool DB `max: 10` → `max: 30` | `app.module.ts` | 5 min | ALTO |
| `pm2 cluster` en producción | servidor | 10 min | ALTO |
| Caché en memoria para config de tenant | `tenants.service.ts` | 1h | MEDIO |
| Documentar specs de instancia | `docs/11` | 5 min | BLOQUEANTE para planificar |
| Redis + `cache-manager` | `docker-compose.prod.yml` | 2-3h | ALTO (largo plazo) |
| Índices compuestos en BD | migración SQL | 30 min | MEDIO (ver Deuda técnica) |

---

## Críticos — producción en riesgo

### WebSocket sin autenticación ni aislamiento por tenant — CRÍTICO

`backend/src/modules/events/events.gateway.ts` tiene `cors: { origin: '*' }` y no valida ningún JWT al conectarse. Cualquier persona en internet puede abrir una conexión WebSocket a `/eventos` y recibir todos los eventos del sistema. Además, `server.emit()` hace broadcast a **todos** los clientes conectados sin filtrar por tenant: los eventos de un lavadero los reciben los clientes de otro.

**Fixes necesarios:**
1. Cambiar `cors: { origin: process.env['ALLOWED_ORIGINS'] }` en el decorator `@WebSocketGateway`
2. Implementar `handleConnection(client)` que valide el JWT del handshake y desconecte si no es válido
3. Usar rooms por tenant: `client.join(tenantId)` al conectar y `server.to(tenantId).emit(...)` al emitir

---

### Sin backup de base de datos — CRÍTICO

No existe ningún script de backup, cron job ni procedimiento documentado. Si el volumen Docker de PostgreSQL falla o se borra accidentalmente, **todos los datos del sistema se pierden sin recuperación posible**.

**Fix mínimo:**
Crear script en el servidor que ejecute `pg_dump` diariamente y suba el resultado a un bucket de Object Storage (Oracle Cloud lo ofrece gratis en tier free):
```bash
# /home/ubuntu/backup.sh
pg_dump -U postgres lavadero | gzip > /backups/lavadero_$(date +%Y%m%d).sql.gz
# Rotar: borrar backups de más de 7 días
find /backups -mtime +7 -delete
```
Agregar al crontab: `0 3 * * * /home/ubuntu/backup.sh`

---

### Sin migraciones de base de datos — ALTO

El proyecto usa `synchronize: true` en desarrollo (TypeORM crea/modifica tablas automáticamente). En producción está desactivado, pero **no existen archivos de migración**. Si se agrega una columna nueva a una entity, el backend en producción arrancará pero la columna no existirá en la BD hasta que se ejecute una migración manual.

Con la arquitectura actual, un deploy de una nueva versión con cambios de schema puede romper producción silenciosamente.

**Fix:** Configurar el sistema de migraciones de TypeORM:
```bash
# Generar migración desde los cambios de entities
npx typeorm migration:generate src/database/migrations/NombreCambio -d src/database/data-source.ts
# Correr migraciones
npx typeorm migration:run -d src/database/data-source.ts
```
Crear `backend/src/database/data-source.ts` como DataSource standalone para usar con el CLI.

---

### Credenciales en `docker-compose.prod.yml` — ALTO

`docker-compose.prod.yml` tiene `POSTGRES_PASSWORD: password` en texto plano dentro del archivo versionado. Cualquiera con acceso al repositorio tiene la contraseña de la base de datos de producción.

**Fix:** Usar Docker secrets o variables de entorno inyectadas desde el servidor, no hardcodeadas en el archivo:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```
Y en el servidor: `export POSTGRES_PASSWORD=...` en `/etc/environment` o en un `.env` local no commiteado.

---

### Flutter — build de release sin signing configurado — ALTO

`applavadero/android/app/build.gradle.kts` tiene un comentario `// TODO: Add your own signing config for the release build.` y usa `signingConfig = signingConfigs.getByName("debug")` incluso en el build de release. La app **no puede subirse a Google Play Store** así. iOS tiene el mismo problema (sin provisioning profile configurado).

**Fix:** Generar un keystore de release, configurarlo en `build.gradle.kts` y documentar el proceso en `docs/11`.

---

### Flutter — URL del servidor hardcodeada — MEDIO

`applavadero/lib/core/api/api_endpoints.dart`:
```dart
const String kBaseUrl = 'http://129.80.17.68:3000';
```
La IP está hardcodeada en el código. Si el servidor cambia de IP o se pasa a HTTPS con dominio, hay que rebuildar y redistribuir la app.

**Fix:** Usar `--dart-define` en el build para inyectar la URL por entorno:
```dart
const String kBaseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://localhost:3000');
```

---

## Tests — cobertura 0%

El proyecto no tiene ningún test real en ninguna de las tres capas:

- **Backend:** `app.controller.spec.ts` y `app.e2e-spec.ts` son plantillas dummy de NestJS que no testean nada del sistema
- **Angular:** 0 archivos `.spec.ts` en `src/app`
- **Flutter:** `test/widget_test.dart` tiene `expect(true, isTrue)` — no testea nada

**Qué testear primero (por impacto):**
1. `auth.service.ts` — lógica de login, hash de contraseña, generación de JWT
2. `turnos.service.ts` — creación de turno, validaciones de estado
3. `caja.service.ts` — cálculo de resumen (lógica con aritmética, propenso a bugs)
4. Guards `JwtAuthGuard`, `RolesGuard` — que rechacen correctamente
5. `FechaFiltroPipe` — validación de formato de fecha

---

## CI/CD — deploy manual sin validaciones

No existe ningún pipeline de integración continua (no hay `.github/workflows/`). El deploy a producción es manual vía SSH. Esto significa que:
- Nadie verifica que el código compile antes de mergear
- No se corren tests en cada PR (aunque tampoco hay tests)
- Un error de tipado puede llegar a producción sin que nadie lo note

**Fix mínimo con GitHub Actions:**
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm ci && npm run build
      - run: cd frontangular && npm ci && npm run build
```

---

## Deuda visual — HTML y modales

### Modales custom duplicados en dashboard y turnos

`dashboard.component.html` (línea ~589) y `turnos.component.html` (línea ~257) tienen modales construidos a mano con `<div class="modal-backdrop">` + `<div class="modal-contenedor">` copiando la estructura del componente `<app-modal>`. Deberían usar `<app-modal>` como el resto de las páginas. Al no usarlo: z-index puede entrar en conflicto, el scroll del body no se bloquea y el diseño puede diferir.

**Fix:** Reemplazar los dos modales custom (el de "Factura generada" en dashboard y turnos) por `<app-modal [visible]="..." titulo="..." (cerrar)="...">`.

### Labels sin `for` e inputs sin `id` en caja

`caja.component.html` tiene varios `<label class="form-label">` sin atributo `for` y los inputs correspondientes sin `id`. Esto rompe la accesibilidad (hacer click en el label no activa el input).

**Fix:** Agregar `id="campo-concepto"` al input y `for="campo-concepto"` al label en los formularios de apertura de caja, gasto e ingreso manual.

### Mensajes de error pueden mostrar `undefined`

En todos los componentes el error se muestra así:
```html
<div class="alerta-error">{{ errorForm }}</div>
```
Si `errorForm` es `undefined` (no se inicializó), muestra la palabra "undefined" en pantalla.

**Fix:** Cambiar a `@if (errorForm) { <div class="alerta-error">{{ errorForm }}</div> }` — o inicializar siempre a `''` en el componente.

### Clase CSS `alerta-error` vs `alert alert-error`

Algunos componentes usan `class="alerta-error"` y caja usa `class="alert alert-error"`. Una de las dos no existe como clase global y el estilo se aplica diferente.

**Fix:** Verificar en `styles.css` cuál es la clase correcta y estandarizar en todos los componentes.

---

## Ruta 404 redirige a `/dashboard` — UX rota

`frontangular/src/app/app.routes.ts` línea 124:
```typescript
{ path: '**', redirectTo: '/dashboard', pathMatch: 'full' },
```
Si un usuario escribe una URL incorrecta o llega con un link roto, se lo manda al dashboard sin ningún mensaje. Si no está autenticado, el guard lo manda al login sin explicar qué pasó.

**Fix:** Crear `pages/not-found/not-found.component.ts` con mensaje claro y botón "Volver al inicio". Registrar como `{ path: '**', loadComponent: () => import('./pages/not-found/...) }`.

---

## Variables de entorno — `.env.example` desactualizado

`backend/.env.example` no incluye `ALLOWED_ORIGINS` ni las variables `SEED_*_EMAIL` / `SEED_*_PASSWORD` que sí se usan en el código. Un desarrollador nuevo que copie `.env.example` como `.env` tendrá el CORS bloqueado sin saber por qué.

**Fix:** Sincronizar `.env.example` con todas las variables usadas en el código, con comentarios explicativos para cada una.

---

## Seed sin datos de prueba

`backend/src/database/seed.ts` solo crea el usuario admin y el superadmin. Para probar el sistema desde cero hace falta crear servicios, clientes, vehículos y turnos manualmente.

**Fix opcional:** Crear un segundo script `seed:demo` que agregue datos ficticios realistas (3 servicios, 5 clientes, 10 turnos en distintos estados) para facilitar el desarrollo y las demos.

---

## Bugs conocidos

- **`logs.service.ts:52`** — error de tipos TypeScript: `tenantId` puede ser `null` pero el método espera `string`. Causa error en runtime si un superadmin genera un log sin tenant.
- **`turnos.component.ts:425`** — `console.error(...)` olvidado de la etapa de depuración. Eliminar antes de próxima release.
- **`nuevo_turno_screen.dart` (Flutter)** — si la llamada a la API falla al crear un turno, la pantalla queda en blanco sin mensaje de error ni botón de reintentar. Agregar catch con `SnackBar` de error.

---

## Deuda técnica

- ~~Quitar `console.log` de performance en el backend (`[PERF]`)~~ ✅ ya no existen
- ~~Quitar `console.log` de debug en `caja.component.ts`~~ ✅ eliminados
- ~~`console.log` de arranque en `main.ts` expone el puerto en producción~~ ✅ protegido con `NODE_ENV !== 'production'`
- Login multi-tenant: si dos lavaderos tienen el mismo email de empleado, hay que identificar el tenant por slug o subdominio
- `tenantId` es nullable en la DB (para que `synchronize: true` no rompa filas existentes); en producción debería ser NOT NULL
- **Índices compuestos en la DB**: las tablas `clientes`, `vehiculos`, `usuarios`, `caja_dia`, `factura` y `turno` no tienen índice en `(tenantId, ...)`. Con múltiples tenants activos las queries se vuelven lentas. Crear índice al menos en `(tenantId, fechaRegistro)` y `(tenantId, estado)` para turnos.
- **Placeholders visibles en sidebar**: las rutas `/gastos`, `/otros-ingresos` y `/cotizaciones` aparecen en la navegación pero no tienen módulo real construido. Ocultarlas o mostrar un banner "Próximamente" hasta que los módulos estén listos.
- **WhatsApp**: el botón de WhatsApp en clientes abre un `window.open()` con un link armado manualmente. No es una integración real. Documentar esto claramente en la UI (tooltip "Abre WhatsApp Web") o reemplazar con la API de WhatsApp Business cuando esté disponible.

---

## Features faltantes — autenticación y comunicación

### H. Recuperar contraseña

No existe ningún flujo de "olvidé mi contraseña". El admin puede cambiar passwords desde Personal, pero si el propio admin pierde el acceso no hay salida sin intervención en la DB.

**Backend necesario:**
- `POST /api/auth/recuperar` — recibe email, genera token con TTL corto (15 min), envía email
- `POST /api/auth/resetear` — recibe token + nueva contraseña, invalida el token
- Tabla o cache para los tokens de reset (Redis o columna en `usuarios`)

**Frontend necesario:**
- Link "¿Olvidaste tu contraseña?" en la pantalla de login
- Página `/recuperar-password` con campo email
- Página `/nueva-password?token=...` con campos nueva contraseña + confirmar

---

### I. Email transaccional

El sistema no envía ningún email. Para recuperar contraseña y para mejorar la experiencia del cliente se necesita un servicio de email.

- Proveedor recomendado: **Resend** (gratuito hasta 3.000 emails/mes) o SendGrid
- Emails mínimos necesarios:
  - Recuperación de contraseña (bloquea el punto anterior)
  - Confirmación de turno al cliente (opcional, requiere módulo Trabajos)
  - Resumen diario de caja al admin (opcional)

**Backend necesario:**
- `EmailModule` con `EmailService` wrapeando el SDK del proveedor elegido
- Template de email en HTML (con logo y colores del tenant)

---

## App móvil — pendientes (applavadero)

El app Flutter cubre el flujo básico (login, mis turnos, crear turno). Estas pantallas y mejoras faltan:

| Ítem | Prioridad | Descripción |
|------|-----------|-------------|
| Reportes | Media | Pantalla de resumen: ingresos, turnos del período, top servicios |
| Facturación | Media | Ver facturas emitidas y detalle de cobro |
| Gastos | Baja | Registrar gasto rápido desde el celular |
| Perfil completo | Media | Cambiar contraseña y ver comisión desde la app |
| Error handling en `nuevo_turno` | Alta | Ver sección "Bugs conocidos" — pantalla queda en blanco al fallar |
| Modo offline mínimo | Baja | Cache local de los últimos turnos para verlos sin conexión |

---

## Landing page / marketing

- Las estadísticas de la landing page están hardcodeadas: "120 lavaderos" y "98% de satisfacción". Actualizar con datos reales o reemplazar con métricas obtenidas del endpoint superadmin (`/api/superadmin/metricas`).
- No hay página de precios pública. Agregar antes de activar la Capa 3 (suscripciones).

---

## Capa 3 — Planes y suscripciones (monetización)

Construir después de que el producto base esté cerrado.

- [ ] Tabla `plan`: nombre, precio, límites (ej: máx empleados, máx trabajos/mes)
- [ ] Tabla `suscripcion`: tenantId, plan, estado (activa/vencida/cancelada), fechaVencimiento
- [ ] Período de prueba gratuita configurable (ej: 14 días)
- [ ] Pantalla "Suscripción y Facturación" para el admin del lavadero
- [ ] Integración con pasarela de pago (Wompi para Colombia, Stripe para internacional)
- [ ] Bloqueo automático si la suscripción vence
- [ ] El superadmin puede activar/suspender suscripciones manualmente

---

## Capa 5 — Mejoras de retención

Para cuando el producto base y la monetización estén funcionando.

| Feature | Descripción |
|---------|-------------|
| **Notificaciones WhatsApp** | Avisar al cliente cuando su auto está listo |
| **Recordatorios de turno** | Mensaje automático el día antes |
| **App móvil / PWA** | Empleados desde el celular |
| **Programa de fidelidad** | Descuentos por frecuencia de visitas |
| **Reservas online** | El cliente saca turno desde una página pública |
| **Múltiples sucursales** | Un lavadero con varias sedes bajo el mismo tenant |

---

## Orden de implementación recomendado

```
── críticos de producción ──
 C1. WebSocket — autenticación + rooms por tenant
 C2. Backup de BD — script + cron en servidor
 C3. Credenciales BD fuera de docker-compose.prod.yml
 C4. Migraciones TypeORM — configurar data-source.ts
── bugs urgentes ──
 0. Arreglar bugs conocidos (logs.service.ts, console.error, nuevo_turno Flutter)
── guards y performance ──
 G0a. Pool DB max:10 → max:30 (5 minutos)
 G0b. pm2 cluster en producción (10 minutos)
 G0c. adminGuard en Angular para rutas solo-admin
 G0d. TenantGuard en backend
 G0e. Interceptor de timeout (15s)
 G0f. Interceptor de logging de requests
── infraestructura ──
 I1. .env.example sincronizar con variables reales
 I2. GitHub Actions CI mínimo (build + typecheck)
 I3. Página 404 en Angular
── refactorización (en paralelo) ──
 R3. date.helper.ts en backend
 R4+R5. BaseCrudService + FormHelpers en Angular
 R1+R2. BaseCrudService + validators en backend
 R7+R8+R9. BaseProvider, initState y ConfirmDialog en Flutter
── producto base ──
 A. Reorganizar sidebar + ocultar placeholders
 B. Módulo Trabajos
 C. Cotizaciones
 D. Gastos con categorías
~~E. Modal Crear cliente mejorado~~ ✅
~~F. Reportes~~ ✅
 G. Permisos por Rol
 H. Recuperar contraseña + email transaccional
── producto base cerrado ──
 I. Índices compuestos en DB (antes de escalar tenants)
 J. Capa 3 — Planes y suscripciones
── monetización activa ──
 K. App móvil completa (reportes, facturación, perfil)
 L. Notificaciones WhatsApp (API real)
 M. Landing page con precios y métricas reales
 N. Múltiples sucursales
```
