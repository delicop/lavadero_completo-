# Pendientes — lo que falta construir

> Última actualización: abril 2026

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
── bugs urgentes ──
 0. Arreglar bugs conocidos (logs.service.ts, console.error, nuevo_turno Flutter)
── refactorización (no bloquea features, hacerlo en paralelo) ──
 R3. date.helper.ts en backend (riesgo de zona horaria)
 R4+R5. BaseCrudService + FormHelpers en Angular
 R1+R2. BaseCrudService + validators en backend
 R7+R8+R9. BaseProvider, initState y ConfirmDialog en Flutter
── guards y performance ──
 G0a. Pool DB max:10 → max:30 (5 minutos, CRÍTICO)
 G0b. pm2 cluster en producción (10 minutos, CRÍTICO)
 G0c. adminGuard en Angular para rutas solo-admin
 G0d. TenantGuard en backend
 G0e. Interceptor de timeout (15s)
 G0f. Interceptor de logging de requests
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
