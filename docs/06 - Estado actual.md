# Estado actual del proyecto

> Última actualización: abril 2026 — Capa 4 completada + mejoras de flujo operativo

---

## Backend — lo que funciona

- [x] Login con JWT (`POST /api/auth/login`)
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
- [x] **Configuración del negocio**: `GET/PATCH /api/tenants/config` — nombre comercial, logo, zona horaria, moneda, WhatsApp, email, dirección, colores de apariencia (`colorPrimario`, `colorSidebar`, `colorFondo`, `colorSuperficie`)
- [x] **Config en login**: `POST /api/auth/login` devuelve `{ accessToken, config }` con los 4 colores y datos del negocio — útil para apps móviles
- [x] **Config en `/me`**: `GET /api/auth/me` también incluye el objeto `config` del tenant
- [x] **Búsqueda de vehículo por placa**: `GET /api/vehiculos/placa/:placa` devuelve el vehículo con su cliente relacionado (`relations: ['cliente']`)
- [x] **Superadmin**: módulo `superadmin` con endpoints para ver/gestionar todos los tenants y usuarios (`GET/PATCH/DELETE /api/superadmin/*`)
- [x] **Rol superadmin**: tercer rol en `RolUsuario` enum (`superadmin` / `admin` / `trabajador`), con `tenantId = null`

---

## Frontend — lo que funciona

- [x] Login (redirige a `/superadmin` si el rol es superadmin, a `/dashboard` para los demás)
- [x] Dashboard con métricas del día (trabajos, ingresos, completados, por cobrar), gráfico semanal, turnos activos, resumen de caja
- [x] Turnos: lista, crear, cambiar estado, filtros
- [x] Caja: abrir/cerrar, gastos, ingresos manuales, resumen con desglose, historial por día
- [x] Facturación: listado filtrable, stats por método de pago, imprimir
- [x] Clientes: lista, crear, editar — el modal incluye campos Nombre, Apellido, Email, Teléfono, Cédula
- [x] Vehículos: lista, crear, editar
- [x] **Flujo "Nueva orden" mejorado**: búsqueda por placa (auto-rellena cliente + vehículo), opción `➕ Crear cliente nuevo...` en el dropdown de cliente, opción `➕ Crear vehículo nuevo...` en el dropdown de vehículo — disponible tanto en Turnos como en el panel Dashboard
- [x] **Creación inline de cliente**: desde la nueva orden se puede crear un cliente sin salir del formulario; el cliente queda auto-seleccionado al guardar
- [x] **Creación inline de vehículo**: desde la nueva orden se puede crear un vehículo para el cliente seleccionado; el vehículo queda auto-seleccionado al guardar (solo Placa y Color son obligatorios)
- [x] **Gastos y Otros Ingresos integrados en Caja**: se quitaron del sidebar; se gestionan directamente desde la página de Caja
- [x] Servicios: lista, crear, editar, activar/desactivar
- [x] Personal: lista, crear, editar empleados (roles: admin / trabajador)
- [x] Liquidaciones: calcular, marcar como pagada
- [x] Asistencia
- [x] Mi Perfil
- [x] Sidebar con grupos colapsables (Operación / Administración)
- [x] Tiempo real: la pantalla se actualiza sin F5 cuando cambian los turnos
- [x] **Registro** (`/registro`): formulario para que un nuevo lavadero cree su cuenta y slug
- [x] **Configuración del negocio** (`/configuracion-negocio`): nombre comercial, logo, zona horaria, moneda, contacto, personalización visual con preview en tiempo real
- [x] **Landing page** (`/`): página pública de venta del SaaS con hero, features, módulos, precios y CTA
- [x] **Panel Superadmin** (`/superadmin`): vista separada, tab Empresas y tab Usuarios, métricas globales, acciones de gestión completa

---

## Capas SaaS completadas

### Capa 1 — Multi-tenancy + Onboarding ✅

1. Tabla `tenants`: `id`, `nombre`, `slug`, `activo`, `fechaCreacion`
2. Columna `tenantId` en todas las tablas
3. JWT contiene `{ userId, rol, tenantId }`
4. Todos los servicios y controllers filtran por `tenantId`
5. Seed crea el tenant `Demo Lavadero` (slug: `demo`)
6. `POST /api/auth/registrar` — crea tenant + admin en una sola operación
7. Pantalla `/registro` con auto-generación de slug

### Capa 2 — Configuración por lavadero ✅

- Nombre comercial y logo
- Zona horaria propia por tenant
- Moneda propia por tenant
- Datos de contacto: WhatsApp, email, dirección
- Personalización visual: 4 colores (`colorPrimario`, `colorSidebar`, `colorFondo`, `colorSuperficie`)
- El tema se aplica a todos los usuarios del tenant vía `sesionResolver`
- El nombre del negocio aparece en la marca del sidebar
- Los 4 colores se persisten en la BD y se devuelven en el login y `/me` para apps externas

### Capa 4 — Superadmin del SaaS ✅

- Ver todos los lavaderos registrados con estadísticas
- Ver métricas globales (turnos hoy, turnos del mes, usuarios activos)
- Activar / suspender un tenant manualmente
- Eliminar un tenant con todos sus datos (con confirmación)
- Rol `superadmin` sin tenantId
- Endpoints protegidos por rol superadmin
- Usuario semilla: `superadmin@lavadero.com` / `Super1234`
