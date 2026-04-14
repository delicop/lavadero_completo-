# ⚙️ El Backend — El cerebro del sistema

## ¿Qué es el backend?

Es el programa que corre "detrás de la pantalla". El usuario no lo ve, pero es el que:
- Recibe los pedidos del frontend ("dame los turnos de hoy")
- Verifica que tenés permiso para hacer eso
- Va a la base de datos a buscar o guardar la información
- Te devuelve la respuesta

Está hecho con **NestJS** (un framework de Node.js en TypeScript).
Corre en http://localhost:3000/api

---

## La estructura de carpetas

```
backend/src/
├── modules/          ← cada módulo maneja una parte del negocio
│   ├── auth/         ← login y seguridad
│   ├── tenants/      ← multi-tenancy: cada lavadero como tenant
│   ├── usuarios/     ← personal del lavadero
│   ├── clientes/     ← clientes del negocio
│   ├── vehiculos/    ← autos de los clientes
│   ├── servicios/    ← tipos de lavado
│   ├── turnos/       ← los turnos del día
│   ├── facturacion/  ← recibos de pago
│   ├── caja/         ← control de plata diaria
│   ├── liquidaciones/← pagos a empleados
│   └── events/       ← tiempo real (WebSockets)
├── common/           ← cosas compartidas entre módulos
│   ├── guards/       ← quién puede pasar (seguridad)
│   ├── interceptors/ ← modifica pedidos y respuestas
│   ├── decorators/   ← etiquetas especiales para el código
│   └── filters/      ← manejo de errores
└── app.module.ts     ← el "índice" que conecta todo
```

---

## Cómo está organizado cada módulo

Cada módulo tiene las mismas piezas:

```
modulo/
├── modulo.module.ts      ← declara qué tiene el módulo
├── modulo.controller.ts  ← recibe los pedidos HTTP (GET, POST, etc.)
├── modulo.service.ts     ← tiene la lógica del negocio
├── dto/                  ← define qué datos se esperan en cada pedido
│   ├── crear-*.dto.ts
│   └── actualizar-*.dto.ts
└── entities/
    └── *.entity.ts       ← representa una tabla en la base de datos
```

**La regla de oro:** el controlador no piensa, solo recibe y delega al servicio.

---

> Para ver cada endpoint y método en detalle: [[backend/_indice]]

## Los módulos explicados uno a uno

### 🔐 Auth — [[backend/auth]]

**¿Qué hace?** Maneja el inicio de sesión.

Cuando un usuario pone su email y contraseña:
1. El sistema busca el usuario en la base de datos
2. Verifica que la contraseña sea correcta (está encriptada)
3. Si todo está bien, genera un **JWT** (un token, como una pulsera de evento)
4. El frontend guarda ese token y lo manda en cada pedido

El token contiene: `{ userId, rol, tenantId }`. Así el sistema sabe quién sos y a qué lavadero pertenecés sin preguntarte cada vez.

**Endpoints:**
- `POST /api/auth/login` → recibe email+contraseña, devuelve el token

---

### 🏢 Tenants — multi-tenancy

**¿Qué hace?** Administra los lavaderos registrados en el sistema.

Cada tenant es un lavadero independiente con sus propios datos (clientes, turnos, caja, etc.). Ningún tenant puede ver datos de otro.

**Cómo funciona el aislamiento:**
1. El JWT incluye `tenantId`
2. El `@UsuarioActual()` decorator extrae el usuario (con su `tenantId`) del token
3. Cada controller pasa el `tenantId` a su servicio
4. Cada servicio agrega `WHERE tenantId = ?` a todos los queries

**Archivos:**
- `modules/tenants/entities/tenant.entity.ts`
- `modules/tenants/tenants.service.ts`
- `modules/tenants/tenants.module.ts`

### 👥 Usuarios — [[backend/usuarios]]

**¿Qué hace?** CRUD de empleados del lavadero.

Cada usuario tiene:
- Nombre, apellido, email, contraseña (encriptada)
- Rol: `admin` o `trabajador`
- % de comisión (ej: 40)
- Si está activo o no
- Si está disponible para tomar turnos

**Endpoints:**
- `GET /api/usuarios` → lista todos
- `POST /api/usuarios` → crea uno nuevo
- `PATCH /api/usuarios/:id` → actualiza
- `DELETE /api/usuarios/:id` → desactiva

---

### 👤 Clientes — [[backend/clientes]]

**¿Qué hace?** CRUD de clientes del negocio.

Datos: nombre, apellido, teléfono (normalizado a `57XXXXXXXXXX`), email.

**Endpoints:**
- `GET /api/clientes` → lista (con búsqueda opcional)
- `POST /api/clientes` → crea
- `GET /api/clientes/:id` → busca uno
- `PATCH /api/clientes/:id` → actualiza

---

### 🚗 Vehículos — [[backend/vehiculos]]

**¿Qué hace?** CRUD de vehículos. Cada vehículo pertenece a un cliente.

Datos: placa, marca, modelo, color, tipo (`auto` / `moto` / `camioneta`).

**Endpoints:**
- `GET /api/vehiculos` → lista todos
- `GET /api/vehiculos/cliente/:clienteId` → los autos de un cliente
- `POST /api/vehiculos` → crea
- `PATCH /api/vehiculos/:id` → actualiza

---

### 🔧 Servicios — [[backend/servicios]]

**¿Qué hace?** Los tipos de lavado que ofrece el negocio.

Datos: nombre, descripción, duración en minutos, precio, tipo de vehículo, activo.

**Endpoints:**
- `GET /api/servicios` → lista los activos
- `POST /api/servicios` → crea
- `PATCH /api/servicios/:id` → actualiza (precio, nombre, etc.)

---

### 📋 Turnos — [[backend/turnos]]

**¿Qué hace?** El corazón del sistema. Maneja los turnos del lavadero.

Un turno pasa por estados: `pendiente → en_proceso → completado` (o `cancelado`).

**Lógica importante:**
- Solo se puede facturar un turno que esté `completado`
- Los turnos se filtran por fecha usando la zona horaria de Colombia (UTC-5)
- El dashboard filtra "los de hoy" comparando con la fecha actual en Bogotá

**Endpoints:**
- `GET /api/turnos` → lista (filtra por fecha, estado, trabajador)
- `POST /api/turnos` → crea
- `PATCH /api/turnos/:id/estado` → cambia el estado
- `GET /api/turnos/:id` → busca uno

---

### 🧾 Facturación — [[backend/facturacion]]

**¿Qué hace?** Genera recibos de pago cuando un cliente paga.

**Reglas:**
- Solo se puede facturar si el turno está `completado`
- No se puede facturar el mismo turno dos veces
- Al crear una factura, **actualiza automáticamente** las columnas de la caja:
  - Si pagó con efectivo → suma a `ventasEfectivo` de la caja del día
  - Si pagó con otro método → suma a `ventasTransferencia`

**Endpoints:**
- `POST /api/facturacion` → crea factura
- `GET /api/facturacion` → lista (filtrable por rango de fechas)
- `GET /api/facturacion/:id` → busca una
- `GET /api/facturacion/turno/:turnoId` → factura de un turno específico

---

### 💰 Caja — [[backend/caja]]

**¿Qué hace?** Controla la caja diaria. Es el módulo más complejo.

**Estado de la caja:** cada día puede tener una sola caja, que está `abierta` o `cerrada`.

**Lo que guarda:**
- Monto con el que se abrió el día
- Columnas pre-computadas: `ventasEfectivo` y `ventasTransferencia` (se actualizan cada vez que se genera una factura, sin necesidad de hacer un JOIN costoso)
- Lista de gastos del día
- Lista de ingresos manuales del día

**El resumen de caja calcula:**
1. Ingresos: monto inicial + ventas efectivo + ventas transferencia + ingresos manuales
2. Gastos: separados por tipo de pago
3. Ganancia de cada empleado: suma sus servicios × su % de comisión
4. Ganancia del lavadero: total ventas − total comisiones empleados
5. Total del día: monto inicial + ganancia lavadero − gastos

**Endpoints:**
- `GET /api/caja/estado` → devuelve si hay caja hoy y si hay alguna sin cerrar
- `POST /api/caja/abrir` → abre la caja del día
- `POST /api/caja/:id/cerrar` → cierra la caja
- `GET /api/caja/:id/resumen` → calcula el resumen completo
- `POST /api/caja/gasto` → registra un gasto
- `DELETE /api/caja/gasto/:id` → elimina un gasto
- `POST /api/caja/ingreso-manual` → registra un ingreso extra
- `DELETE /api/caja/ingreso-manual/:id` → elimina un ingreso
- `GET /api/caja/historial` → lista las últimas 30 cajas cerradas

---

### 🌐 Events — Tiempo real (WebSockets)

**¿Qué hace?** Permite que la pantalla se actualice sola sin que el usuario apriete F5.

Usa **Socket.IO** (una librería de WebSockets). Cuando pasa algo importante en el servidor (ej: un turno se completó), manda una señal a todos los navegadores conectados.

**Eventos que emite:**
- `turno_actualizado` → cuando cambia el estado de un turno
- `usuario_actualizado` → cuando cambia algo de un usuario

El frontend se suscribe a estos eventos y actualiza la pantalla automáticamente.

---

## La seguridad — cómo funciona

```
Pedido del navegador
        ↓
  JwtAuthGuard          ← ¿Tiene token válido?
        ↓
  RolesGuard            ← ¿Tiene el rol necesario?
        ↓
  Controlador           ← Recibe el pedido
        ↓
  Servicio              ← Procesa la lógica
        ↓
  Base de datos         ← Guarda o devuelve datos
        ↓
  Respuesta al navegador
```

Si el token no existe → error 401 (No autorizado)
Si el rol no alcanza → error 403 (Prohibido)
