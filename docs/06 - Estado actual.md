# 📊 Estado actual del proyecto

> Última actualización: abril 2026 — multi-tenancy implementado

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

### ✅ Capa 1 — Multi-tenancy — IMPLEMENTADO

**¿Qué se hizo?**

1. Tabla `tenants`: `id`, `nombre`, `slug`, `activo`, `fechaCreacion`
2. Columna `tenantId` en **todas** las tablas del sistema
3. JWT ahora contiene `{ userId, rol, tenantId }`
4. Todos los servicios reciben `tenantId` como parámetro y lo aplican en cada query
5. Todos los controllers extraen `tenantId` del usuario autenticado (`@UsuarioActual()`)
6. Seed crea el tenant `Demo Lavadero` (slug: `demo`) y asigna el admin

**Lo que falta para completar esta capa:**
- [ ] Pantalla de **registro de nuevo lavadero** (onboarding) — el dueño crea su cuenta y elige su slug
- [ ] Login con identificación de tenant (hoy el email del usuario es globalmente único; en el futuro dos tenants podrían tener el mismo email y habría que distinguirlos por slug o subdominio)

---

### Capa 2 — Configuración por lavadero

Cada lavadero debe poder personalizar su propia instancia:

- [ ] Nombre del negocio y logo (para que aparezca en facturas)
- [ ] Zona horaria propia (hoy está hardcodeada a UTC-5 Colombia)
- [ ] Moneda (hoy está hardcodeada a COP)
- [ ] Datos de contacto para WhatsApp
- [ ] Configurar qué módulos tiene habilitados según su plan

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
✅ 1. Multi-tenancy (Capa 1)                            ← HECHO
   2. Completar placeholders (Gastos, Otros Ingresos)   ← producto base terminado
   3. Registro y onboarding de nuevos lavaderos          ← para poder vender
   4. Configuración por lavadero (nombre, logo)          ← personalización mínima
   5. Planes y suscripciones                             ← monetización
   6. Superadmin                                         ← operación del SaaS
   7. Notificaciones WhatsApp                            ← diferenciador de valor
   8. Reportes y gráficos                                ← retención de clientes
```

### Deuda técnica pendiente

- Quitar los `console.log` de performance del backend (`[PERF] ...`) antes de producción
- Quitar los `console.log` de debug en `caja.component.ts` (`[CAJA] ngOnInit START`)
- Login multi-tenant: cuando haya múltiples tenants con el mismo email de empleado, el login necesita identificar el tenant (por slug o subdominio)

