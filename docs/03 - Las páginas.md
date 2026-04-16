# 🖥️ Las páginas — Qué hace cada pantalla

El sistema tiene una barra lateral (sidebar) con todas las secciones.
Está dividida en grupos.

---

> Para ver cada función y método en detalle: [[frontend/_indice]]

## 📌 Panel (`/dashboard`) — [[frontend/dashboard]]

La pantalla principal. Es como el "centro de control" del día.

**Para el Admin muestra:**
- Los turnos de hoy agrupados: En proceso / Pendientes / Completados
- Un botón para crear un nuevo turno directamente desde ahí
- Un botón para cobrar (facturar) cuando un turno está completado
- Cuánta plata entró hoy en total
- Notificaciones en tiempo real (si alguien completa un turno, la pantalla se actualiza sola)

**Para el Trabajador muestra:**
- Solo sus propios turnos del día
- Su ganancia estimada del día

---

## Grupo — Operación (solo Admin)

### 📋 Turnos (`/turnos`) — [[frontend/turnos]]
Lista de todos los turnos. Por defecto muestra solo los de hoy.
- Se puede filtrar por fecha, estado, trabajador
- Se puede crear un nuevo turno
- Se puede cambiar el estado de un turno
- Se puede ver el detalle

### 💰 Caja (`/caja`) — [[frontend/caja]]
Control de la caja del día. Tiene varias "vistas" según el estado:

| Vista | Cuándo aparece |
|-------|----------------|
| **Abrir caja** | No hay caja de hoy todavía |
| **Cerrar anterior** | Hay una caja de un día anterior sin cerrar |
| **Caja abierta** | La caja de hoy está abierta |
| **Caja cerrada** | La caja de hoy ya se cerró |

Cuando la caja está abierta podés:
- Ver el resumen de ingresos y gastos
- Registrar un gasto (efectivo o transferencia)
- Registrar un ingreso manual (plata extra que entró)
- Ver la lista de facturas del día
- Ver cuánto ganó cada empleado
- Cerrar la caja

### 📤 Gastos (`/gastos`) — 🔲 En construcción
Pensado para ver el historial de gastos. Todavía no está implementado.

### 📥 Otros Ingresos (`/otros-ingresos`) — 🔲 En construcción
Para ver ingresos que no vienen de servicios. Todavía no está implementado.

### 📄 Cotizaciones (`/cotizaciones`) — 🔲 En construcción
Para generar presupuestos antes de cobrar. Todavía no está implementado.

### 💸 Liquidaciones (`/liquidaciones`) — [[frontend/liquidaciones]]
Calcula cuánto le corresponde pagar a cada empleado por un período.
- Se elige el empleado y el rango de fechas
- El sistema suma todos sus servicios completados y aplica su % de comisión

### ✅ Asistencia (`/asistencia`) — [[frontend/asistencia]]
Registro de quién vino a trabajar cada día.

---

## Grupo — Administración (solo Admin)

### 🧾 Facturación (`/facturacion`) — [[frontend/facturacion]]
Historial de todas las facturas generadas.
- Filtrás por rango de fechas
- Ves el total por método de pago (efectivo, transferencia, débito, crédito)
- Podés imprimir una factura

### 📅 Historial Caja (`/historial-caja`) — [[frontend/historial-caja]]
Lista de todas las cajas cerradas (un accordion por día).
- Hacés click en un día y se expande el resumen
- Ves los gastos, ingresos, facturas y ganancias de ese día

### 👥 Clientes (`/clientes`) — [[frontend/clientes]]
CRUD de clientes.
- Crear, editar, buscar clientes
- Ver los vehículos de cada cliente

### 🚗 Vehículos (`/vehiculos`) — [[frontend/vehiculos]]
CRUD de vehículos.
- Cada vehículo pertenece a un cliente
- Datos: placa, marca, modelo, color, tipo (auto/moto/camioneta)

### ⚙️ Servicios (`/servicios`) — [[frontend/servicios]]
Los tipos de lavado que ofrece el negocio.
- Cada servicio tiene: nombre, descripción, duración, precio, tipo de vehículo
- Se pueden activar o desactivar

### 👤 Personal (`/configuracion`) — [[frontend/configuracion]]
CRUD de empleados.
- Crear, editar, activar/desactivar empleados
- Configurar el % de comisión de cada uno
- Roles: admin o trabajador

### 🙋 Mi Perfil (`/mi-perfil`) — [[frontend/mi-perfil]]
El usuario logueado puede ver y editar su propia información.

---

## Login (`/login`)
La pantalla de inicio de sesión. Pide email y contraseña.
Usa JWT (un "ticket" digital) para autenticar. El ticket se guarda en el navegador y se manda automáticamente en cada pedido al servidor.

---

## Páginas públicas (sin login)

### 🏠 Landing (`/`) — página de venta del SaaS

La página principal del producto, visible para cualquiera sin estar logueado.

**Objetivo:** vender el sistema a nuevos lavaderos. Es la primera cosa que ve alguien que llega a la URL.

**Secciones:**

| Sección | Descripción |
|---------|-------------|
| **Navbar** | Logo + botón "Iniciar sesión" (→ `/login`) + botón "Empezar gratis" (→ `/registro`) |
| **Hero** | Título grande, bajada, mock visual de la app con datos de ejemplo |
| **Features** | 6 cards con las funcionalidades principales (turnos, caja, facturación, personal, tiempo real, dashboard) |
| **Módulos incluidos** | Chips con todo lo que trae el plan (12 módulos) |
| **Cómo funciona** | 3 pasos: crear cuenta → configurar → operar |
| **Precios** | Plan Básico ($89k COP/mes) y Plan Profesional ($179k COP/mes) |
| **CTA final** | "14 días gratis, sin tarjeta de crédito" |
| **Footer** | Links a login y registro |

**Archivos:**
- `frontangular/src/app/pages/landing/landing.component.ts` — componente con CSS propio (estilos aislados, no usa el CSS global del app)
- `frontangular/src/app/pages/landing/landing.component.html` — template completo

**Cómo está registrada la ruta:**
```ts
// app.routes.ts
{
  path: '',
  pathMatch: 'full',   // solo captura la raíz '/', no afecta las sub-rutas del app
  loadComponent: () => import('./pages/landing/landing.component')...
}
```
El truco de `pathMatch: 'full'` hace que la landing solo responda a la URL `/` exacta, sin pisar las rutas protegidas (`/dashboard`, `/turnos`, etc.) que también usan el prefijo `''`.

**Para personalizar:**
- El nombre "LavaderoApp" en el navbar y footer se puede cambiar directamente en el HTML
- Los precios están hardcodeados en el HTML — cuando exista la Capa 3 (planes y suscripciones) se pueden leer desde la API
- El mock visual de la app (la tabla de turnos falsa) vive dentro del bloque `.hero-demo` del HTML

---

### 📝 Registro (`/registro`)
Formulario para que un nuevo lavadero cree su cuenta y empiece a usar el sistema.
- Pide: nombre del negocio, slug (URL única), nombre/apellido/email/contraseña del admin
- El slug se auto-genera desde el nombre del negocio pero se puede editar
- Al completar el registro se loguea automáticamente y redirige al dashboard
