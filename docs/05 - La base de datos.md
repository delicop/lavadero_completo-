# 🗄️ La Base de Datos

## ¿Qué es la base de datos?

Es como un montón de planillas de Excel, pero mucho más poderoso.
Cada "planilla" se llama **tabla**, y cada fila es un registro.

El sistema usa **PostgreSQL**, un motor de base de datos gratuito y muy robusto.
Corre dentro de **Docker** (un contenedor, como una caja que tiene todo lo necesario adentro).

---

## Las tablas — una por una

### `tenant`
El lavadero como negocio. Cada tenant es una empresa que usa el sistema.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | Identificador único |
| nombre | texto | Ej: "Lavadero El Rápido" |
| slug | texto (único) | Identificador URL-friendly, ej: `el-rapido` |
| activo | boolean | Si el tenant puede usar el sistema |
| fechaCreacion | fecha | Cuándo se registró |
| nombreComercial | texto (nullable) | Nombre visible en facturas y comprobantes |
| logo | texto (nullable) | URL del logo del negocio |
| zonaHoraria | texto | Zona IANA, ej: `America/Bogota`. Default: `America/Bogota` |
| moneda | texto | Código ISO, ej: `COP`. Default: `COP` |
| telefonoWhatsapp | texto (nullable) | Ej: `573001234567` |
| emailContacto | texto (nullable) | Email de contacto del negocio |
| direccion | texto (nullable) | Dirección física |
| colorPrimario | texto (nullable) | Color hex para botones y acciones, ej: `#2563eb` |
| colorSidebar | texto (nullable) | Color hex del fondo del sidebar, ej: `#0f172a` |
| colorFondo | texto (nullable) | Color hex del área de contenido, ej: `#f8fafc` |
| colorSuperficie | texto (nullable) | Color hex de cards, inputs y modales, ej: `#ffffff` |

---

### `usuario`
Los empleados del lavadero.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | Identificador único |
| nombre | texto | Ej: "Juan" |
| apellido | texto | Ej: "Pérez" |
| email | texto (único global) | Para iniciar sesión |
| passwordHash | texto | La contraseña **encriptada** (nunca se guarda en texto plano) |
| rol | enum | `admin` o `trabajador` |
| activo | boolean | Si puede entrar al sistema |
| disponible | boolean | Si puede tomar turnos |
| comisionPorcentaje | número | Ej: 40 = 40% |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |
| fechaRegistro | fecha | Cuándo se creó |

> 💡 El `email` del usuario es único globalmente (no por tenant) para simplificar el login en la fase actual.

---

### `cliente`
Los dueños de los autos que vienen al lavadero.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | Identificador único |
| nombre | texto | |
| apellido | texto | |
| telefono | texto | Formato: `57XXXXXXXXXX` |
| email | texto | Opcional — único por tenant |
| cedula | texto | Opcional |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |
| fechaRegistro | fecha | |

---

### `vehiculo`
Los autos de los clientes.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| clienteId | UUID | A qué cliente pertenece (FK → cliente) |
| placa | texto | Ej: "ABC123" — único por tenant |
| marca | texto | Ej: "Toyota" |
| modelo | texto | Ej: "Corolla" |
| color | texto | Ej: "Rojo" |
| tipo | enum | `auto`, `moto`, `camioneta` |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |
| fechaRegistro | fecha | |

---

### `servicio`
Los tipos de lavado que ofrece el negocio.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| nombre | texto | Ej: "Lavado básico" — único por tipo+tenant |
| descripcion | texto | Opcional |
| tipoVehiculo | texto | Ej: "auto", "moto" |
| duracionMinutos | número | Ej: 30 |
| precio | número | Ej: 25000 (pesos COP) |
| activo | boolean | Si está disponible para ofrecer |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |

---

### `turno`
El registro de cada trabajo que se hace en el lavadero.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| clienteId | UUID | FK → cliente |
| vehiculoId | UUID | FK → vehiculo |
| servicioId | UUID | FK → servicio |
| trabajadorId | UUID | FK → usuario (el que lo atiende) |
| fechaHora | timestamp | Cuándo se registró |
| estado | enum | `pendiente`, `en_proceso`, `completado`, `cancelado` |
| observaciones | texto | Opcional |
| liquidacionId | UUID | FK → liquidacion (null si no fue liquidado) |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |
| fechaRegistro | fecha | |

---

### `factura`
El recibo de pago de cada turno cobrado.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| turnoId | UUID | FK → turno (relación 1 a 1) |
| total | número | Cuánto pagó el cliente |
| metodoPago | enum | `efectivo`, `transferencia`, `debito`, `credito` |
| observaciones | texto | Opcional |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |
| fechaEmision | timestamp | Cuándo se cobró |

---

### `caja_dia`
La caja de cada día de trabajo.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| fecha | texto | Ej: "2026-04-13" — único por tenant |
| montoInicial | número | Con cuánta plata se abrió |
| ventasEfectivo | número | Pre-computado: suma automática de ventas en efectivo |
| ventasTransferencia | número | Pre-computado: suma automática de ventas en transferencia |
| estado | enum | `abierta` o `cerrada` |
| usuarioAperturaId | UUID | FK → usuario |
| usuarioCierreId | UUID | FK → usuario (null si está abierta) |
| fechaApertura | timestamp | |
| fechaCierre | timestamp | null si está abierta |
| observaciones | texto | Opcional |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |

> 💡 **¿Por qué `ventasEfectivo` y `ventasTransferencia` están en la caja?**
> En lugar de sumar todas las facturas del día cada vez que se pide el resumen (lo que sería lento), cuando se crea una factura se incrementa directamente esa columna. Así el resumen se calcula mucho más rápido.

---

### `gasto_caja`
Los gastos que ocurrieron durante un día.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| cajaDiaId | UUID | FK → caja_dia |
| concepto | texto | Ej: "Jabón líquido" |
| monto | número | Ej: 15000 |
| tipoPago | enum | `efectivo` o `transferencia` |
| usuarioId | UUID | Quién lo registró |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |
| fechaRegistro | timestamp | |

---

### `ingreso_manual_caja`
Plata que entró al negocio por algo distinto a un lavado.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| cajaDiaId | UUID | FK → caja_dia |
| concepto | texto | Ej: "Venta de ambientador" |
| monto | número | |
| tipoPago | enum | `efectivo` o `transferencia` |
| usuarioId | UUID | Quién lo registró |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |
| fechaRegistro | timestamp | |

---

### `liquidacion`
El pago a un empleado por su trabajo en un período.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| trabajadorId | UUID | FK → usuario |
| fechaDesde | texto | Inicio del período |
| fechaHasta | texto | Fin del período |
| cantidadTurnos | número | Cuántos turnos hizo |
| totalServicios | número | Suma de los precios de sus servicios |
| comisionPorcentaje | número | Su % al momento de liquidar |
| totalPago | número | Lo que se le paga |
| estado | enum | `pendiente` o `pagada` |
| fechaPago | timestamp | null si no se pagó todavía |
| tenantId | UUID (FK → tenant) | A qué lavadero pertenece |
| fechaCreacion | timestamp | |

---

## El diagrama de relaciones (simplificado)

```
tenant ──────────────────────────────────────────┐
   │                                             │ (todos los datos
   │                                             │  pertenecen a un tenant)
   ↓                                             ↓
cliente ──┐
          ├──→ vehiculo ──→ turno ──→ factura
usuario ──┘         ↑         ↑
                 servicio   caja_dia ──→ gasto_caja
                                    ──→ ingreso_manual_caja
usuario ──→ liquidacion
```

---

## Ver la base de datos visualmente

Abrí http://localhost:5050 (pgAdmin) con Docker corriendo.
- Email: admin@lavadero.com
- Contraseña: admin (configurada en el docker-compose)
