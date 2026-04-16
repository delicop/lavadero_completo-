# 📊 Estado actual del proyecto

> Última actualización: abril 2026 — Capa 2 completada (configuración por lavadero)

---

## ✅ Qué está terminado y funciona

### Backend (API)
- [x] Login con JWT
- [x] CRUD de usuarios / personal
- [x] CRUD de clientes
- [x] CRUD de vehículos
- [x] CRUD de servicios (con campo `tipoVehiculo`)
- [x] Turnos: crear, listar, cambiar estado, filtrar por fecha/estado/trabajador
- [x] Facturación: crear factura, listar por rango de fechas, buscar por id/turno
- [x] Caja: abrir, cerrar, gastos, ingresos manuales, resumen completo, historial
- [x] Liquidaciones: calcular y marcar como pagada
- [x] WebSockets: eventos en tiempo real para turnos y usuarios
- [x] Zona horaria Colombia (UTC-5) en todos los filtros de fecha
- [x] **Multi-tenancy**: tabla `tenants`, `tenantId` en todas las entidades, JWT incluye `tenantId`, todos los queries filtran por tenant
- [x] **Registro de nuevo lavadero**: `POST /api/auth/registrar` crea tenant + usuario admin en una sola operación
- [x] **Configuración del negocio**: `GET/PATCH /api/tenants/config` — nombre comercial, logo, zona horaria, moneda, WhatsApp, email, dirección

### Frontend (Angular)
- [x] Login
- [x] Dashboard con gestión completa del día (turnos + facturación inline)
- [x] Turnos: lista, crear, cambiar estado, filtros
- [x] Caja: abrir/cerrar, gastos, ingresos manuales, resumen con desglose
- [x] Historial de caja: accordion por día con resumen detallado
- [x] Facturación: listado filtrable, stats por método de pago, imprimir
- [x] Clientes: lista, crear, editar
- [x] Vehículos: lista, crear, editar
- [x] Servicios: lista, crear, editar, activar/desactivar
- [x] Personal: lista, crear, editar empleados
- [x] Liquidaciones: calcular, marcar como pagada
- [x] Asistencia
- [x] Mi Perfil
- [x] Sidebar con grupos colapsables (Operación / Administración)
- [x] Tiempo real: la pantalla se actualiza sin F5 cuando cambian los turnos
- [x] **Pantalla de registro** (`/registro`): formulario para que un nuevo lavadero cree su cuenta y slug
- [x] **Configuración del negocio** (`/configuracion-negocio`): nombre comercial, logo, zona horaria, moneda, contacto
- [x] **Landing page** (`/`): página pública de venta del SaaS con hero, features, módulos, precios y CTA

---

## 🔲 Próximos pasos — corto plazo (completar el producto base)

### Páginas placeholder (solo tienen el archivo `.ts`, sin template)

| Página | Ruta | Qué debería hacer |
|--------|------|-------------------|
| **Gastos** | `/gastos` | Historial de todos los gastos registrados en cajas pasadas, filtrable por fecha |
| **Otros Ingresos** | `/otros-ingresos` | Historial de ingresos manuales de todas las cajas |
| **Cotizaciones** | `/cotizaciones` | Generar un presupuesto para un cliente antes de cobrar |

### Deuda técnica

- Quitar los `console.log` de performance del backend (`[PERF] ...`) antes de producción
- Quitar los `console.log` de debug en `caja.component.ts` (`[CAJA] ngOnInit START`)

---

## 🚀 Roadmap — convertir esto en un SaaS

El objetivo a futuro es vender este sistema a **múltiples lavaderos** como un servicio (SaaS).
Cada lavadero es un cliente que paga una suscripción mensual.

Para llegar ahí hay que construir varias cosas en capas:

---

### ✅ Capa 1 — Multi-tenancy + Onboarding — COMPLETADA

**¿Qué se hizo?**

1. Tabla `tenants`: `id`, `nombre`, `slug`, `activo`, `fechaCreacion`
2. Columna `tenantId` en **todas** las tablas del sistema
3. JWT ahora contiene `{ userId, rol, tenantId }`
4. Todos los servicios reciben `tenantId` como parámetro y lo aplican en cada query
5. Todos los controllers extraen `tenantId` del usuario autenticado (`@UsuarioActual()`)
6. Seed crea el tenant `Demo Lavadero` (slug: `demo`) y asigna el admin
7. `POST /api/auth/registrar` — endpoint público que crea un tenant + admin en una sola operación
8. Pantalla `/registro` en el frontend — formulario con auto-generación de slug, enlazado desde `/login`

**Pendiente futuro (no bloquea el producto):**
- [ ] Login multi-tenant: si dos lavaderos tuvieran el mismo email de empleado, habría que identificar el tenant por slug o subdominio. Hoy el email es globalmente único.

---

### ✅ Capa 2 — Configuración por lavadero — COMPLETADA

Cada lavadero puede personalizar su propia instancia desde `/configuracion-negocio`:

- [x] Nombre comercial y logo (para que aparezca en facturas)
- [x] Zona horaria propia (dinámica por tenant, antes hardcodeada a UTC-5)
- [x] Moneda (dinámica por tenant, antes hardcodeada a COP)
- [x] Datos de contacto: WhatsApp, email, dirección
- [ ] Configurar qué módulos tiene habilitados según su plan ← depende de Capa 3

---

### Capa 3 — Planes y facturación del SaaS

El sistema necesita saber qué plan tiene cada lavadero y cobrarle:

- [ ] Tabla `plan`: nombre (básico, profesional, etc.), precio, límites (ej: máx 5 empleados, máx 200 turnos/mes)
- [ ] Tabla `suscripcion`: tenantId, plan, estado (activa, vencida, cancelada), fechaVencimiento
- [ ] Integración con pasarela de pago (ej: Wompi para Colombia, Stripe para internacional)
- [ ] Página de admin del SaaS para ver todos los tenants, suscripciones y estado de pagos
- [ ] Bloqueo automático si la suscripción vence

---

### Capa 4 — Superadmin del SaaS

Una interfaz separada (o una sección protegida) para el dueño del SaaS:

- [ ] Ver todos los lavaderos registrados
- [ ] Ver métricas globales (cuántos turnos se procesaron hoy en total, etc.)
- [ ] Activar / suspender un tenant manualmente
- [ ] Ver logs de errores por tenant

---

### Capa 5 — Mejoras de producto para retener clientes

Funcionalidades que hacen el sistema más valioso para cada lavadero:

| Funcionalidad | Descripción |
|---------------|-------------|
| **Notificaciones WhatsApp** | Avisar al cliente cuando su auto está listo (ya hay utilidades para esto en el código) |
| **Recordatorios de turno** | Mensaje automático al cliente el día antes |
| **App móvil / PWA** | Que los empleados puedan usarlo desde el celular |
| **Reportes y gráficos** | Ingresos por semana, mes, año — comparativas |
| **Programa de fidelidad** | Registrar cuántas veces vino un cliente, dar descuentos |
| **Reservas online** | Que el cliente saque turno desde una página pública |
| **Múltiples sucursales** | Un lavadero con varias sedes bajo el mismo tenant |

---

## 📋 Orden recomendado para implementar

```
✅ 1. Multi-tenancy + Onboarding (Capa 1)               ← COMPLETADO
✅ 2. Configuración por lavadero (Capa 2)                ← COMPLETADO
   3. Completar placeholders (Gastos, Otros Ingresos)   ← producto base terminado
   4. Planes y suscripciones                             ← monetización
   5. Superadmin                                         ← operación del SaaS
   6. Notificaciones WhatsApp                            ← diferenciador de valor
   7. Reportes y gráficos                                ← retención de clientes
```

### Deuda técnica pendiente

- Quitar los `console.log` de performance del backend (`[PERF] ...`) antes de producción
- Quitar los `console.log` de debug en `caja.component.ts` (`[CAJA] ngOnInit START`)
- Login multi-tenant: cuando haya múltiples tenants con el mismo email de empleado, el login necesita identificar el tenant (por slug o subdominio)
- `tenantId` es nullable en la DB (para que `synchronize: true` no rompa filas existentes); en producción real debería ser NOT NULL

