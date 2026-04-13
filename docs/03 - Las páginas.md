# 🖥️ Las páginas — Qué hace cada pantalla

El sistema tiene una barra lateral (sidebar) con todas las secciones.
Está dividida en grupos.

---

## 📌 Panel (`/dashboard`)

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

### 📋 Turnos (`/turnos`)
Lista de todos los turnos. Por defecto muestra solo los de hoy.
- Se puede filtrar por fecha, estado, trabajador
- Se puede crear un nuevo turno
- Se puede cambiar el estado de un turno
- Se puede ver el detalle

### 💰 Caja (`/caja`)
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

### 💸 Liquidaciones (`/liquidaciones`)
Calcula cuánto le corresponde pagar a cada empleado por un período.
- Se elige el empleado y el rango de fechas
- El sistema suma todos sus servicios completados y aplica su % de comisión

### ✅ Asistencia (`/asistencia`)
Registro de quién vino a trabajar cada día.

---

## Grupo — Administración (solo Admin)

### 🧾 Facturación (`/facturacion`)
Historial de todas las facturas generadas.
- Filtrás por rango de fechas
- Ves el total por método de pago (efectivo, transferencia, débito, crédito)
- Podés imprimir una factura

### 📅 Historial Caja (`/historial-caja`)
Lista de todas las cajas cerradas (un accordion por día).
- Hacés click en un día y se expande el resumen
- Ves los gastos, ingresos, facturas y ganancias de ese día

### 👥 Clientes (`/clientes`)
CRUD de clientes.
- Crear, editar, buscar clientes
- Ver los vehículos de cada cliente

### 🚗 Vehículos (`/vehiculos`)
CRUD de vehículos.
- Cada vehículo pertenece a un cliente
- Datos: placa, marca, modelo, color, tipo (auto/moto/camioneta)

### ⚙️ Servicios (`/servicios`)
Los tipos de lavado que ofrece el negocio.
- Cada servicio tiene: nombre, descripción, duración, precio, tipo de vehículo
- Se pueden activar o desactivar

### 👤 Personal (`/configuracion`)
CRUD de empleados.
- Crear, editar, activar/desactivar empleados
- Configurar el % de comisión de cada uno
- Roles: admin o trabajador

### 🙋 Mi Perfil (`/mi-perfil`)
El usuario logueado puede ver y editar su propia información.

---

## Login (`/login`)
La pantalla de inicio de sesión. Pide email y contraseña.
Usa JWT (un "ticket" digital) para autenticar. El ticket se guarda en el navegador y se manda automáticamente en cada pedido al servidor.
