# 📊 Estado actual del proyecto

> Última actualización: abril 2026
> El proyecto está commiteado y subido a git.

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

### Capa 1 — Multi-tenancy (el más importante, todo lo demás depende de esto)

**¿Qué es?** Que una sola instalación del sistema sirva a muchos lavaderos al mismo tiempo, y que cada uno vea **solo sus propios datos**.

**¿Qué hay que cambiar?**

1. Agregar tabla `tenant` (el "lavadero"):
   ```
   tenant: id, nombre, slug, plan, activo, fechaCreacion
   ```

2. Agregar `tenantId` a **todas** las tablas del sistema (usuarios, clientes, vehículos, servicios, turnos, facturas, caja, etc.)

3. Crear un `TenantGuard` que lea el `tenantId` del JWT y lo agregue automáticamente a **todos** los queries de TypeORM, para que sea imposible que un lavadero vea datos de otro.

4. El JWT pasa a tener: `{ userId, rol, tenantId }`

5. Agregar una pantalla de **registro de nuevo lavadero** (onboarding) donde el dueño crea su cuenta y elige su subdominio (ej: `milavadero.tuapp.com`)

> ⚠️ Este cambio es estructural. Conviene hacerlo antes de tener datos reales en producción porque requiere migrar todas las tablas.

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
1. Completar placeholders (Gastos, Otros Ingresos)    ← producto base terminado
2. Multi-tenancy                                        ← fundación del SaaS
3. Registro y onboarding de nuevos lavaderos            ← para poder vender
4. Configuración por lavadero (nombre, logo)            ← personalización mínima
5. Planes y suscripciones                               ← monetización
6. Superadmin                                           ← operación del SaaS
7. Notificaciones WhatsApp                              ← diferenciador de valor
8. Reportes y gráficos                                  ← retención de clientes
```
