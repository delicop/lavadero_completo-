# 🗄️ La Base de Datos

## ¿Qué es la base de datos?

Es como un montón de planillas de Excel, pero mucho más poderoso.
Cada "planilla" se llama **tabla**, y cada fila es un registro.

El sistema usa **PostgreSQL**, un motor de base de datos gratuito y muy robusto.
Corre dentro de **Docker** (un contenedor, como una caja que tiene todo lo necesario adentro).

---

## Las tablas — una por una

### `usuario`
Los empleados del lavadero.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | Identificador único |
| nombre | texto | Ej: "Juan" |
| apellido | texto | Ej: "Pérez" |
| email | texto | Para iniciar sesión |
| passwordHash | texto | La contraseña **encriptada** (nunca se guarda en texto plano) |
| rol | enum | `admin` o `trabajador` |
| activo | boolean | Si puede entrar al sistema |
| disponible | boolean | Si puede tomar turnos |
| comisionPorcentaje | número | Ej: 40 = 40% |
| fechaRegistro | fecha | Cuándo se creó |

---

### `cliente`
Los dueños de los autos que vienen al lavadero.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | Identificador único |
| nombre | texto | |
| apellido | texto | |
| telefono | texto | Formato: `57XXXXXXXXXX` |
| email | texto | Opcional |
| fechaRegistro | fecha | |

---

### `vehiculo`
Los autos de los clientes.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| clienteId | UUID | A qué cliente pertenece (FK → cliente) |
| placa | texto | Ej: "ABC123" |
| marca | texto | Ej: "Toyota" |
| modelo | texto | Ej: "Corolla" |
| color | texto | Ej: "Rojo" |
| tipo | enum | `auto`, `moto`, `camioneta` |
| fechaRegistro | fecha | |

---

### `servicio`
Los tipos de lavado que ofrece el negocio.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| nombre | texto | Ej: "Lavado básico" |
| descripcion | texto | Opcional |
| tipoVehiculo | texto | Ej: "auto", "moto" |
| duracionMinutos | número | Ej: 30 |
| precio | número | Ej: 25000 (pesos COP) |
| activo | boolean | Si está disponible para ofrecer |

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
| fechaEmision | timestamp | Cuándo se cobró |

---

### `caja_dia`
La caja de cada día de trabajo.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | |
| fecha | texto | Ej: "2026-04-13" |
| montoInicial | número | Con cuánta plata se abrió |
| ventasEfectivo | número | Pre-computado: suma automática de ventas en efectivo |
| ventasTransferencia | número | Pre-computado: suma automática de ventas en transferencia |
| estado | enum | `abierta` o `cerrada` |
| usuarioAperturaId | UUID | FK → usuario |
| usuarioCierreId | UUID | FK → usuario (null si está abierta) |
| fechaApertura | timestamp | |
| fechaCierre | timestamp | null si está abierta |
| observaciones | texto | Opcional |

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
| fechaCreacion | timestamp | |

---

## El diagrama de relaciones (simplificado)

```
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
