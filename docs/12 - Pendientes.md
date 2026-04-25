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

## Deuda técnica

- ~~Quitar `console.log` de performance en el backend (`[PERF]`)~~ ✅ ya no existen
- ~~Quitar `console.log` de debug en `caja.component.ts`~~ ✅ eliminados
- ~~`console.log` de arranque en `main.ts` expone el puerto en producción~~ ✅ protegido con `NODE_ENV !== 'production'`
- Login multi-tenant: si dos lavaderos tienen el mismo email de empleado, hay que identificar el tenant por slug o subdominio
- `tenantId` es nullable en la DB (para que `synchronize: true` no rompa filas existentes); en producción debería ser NOT NULL

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
A. Reorganizar sidebar
B. Módulo Trabajos
C. Cotizaciones
D. Gastos con categorías
~~E. Modal Crear cliente mejorado~~ ✅
F. Reportes ✅
G. Permisos por Rol
── producto base cerrado ──
H. Capa 3 — Planes y suscripciones
── monetización activa ──
I. Notificaciones WhatsApp
J. App móvil / PWA
K. Múltiples sucursales
```
