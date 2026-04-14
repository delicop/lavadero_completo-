# Caja — módulo de caja

**Ver también:** [[_indice]] | [[../04 - El backend]] | [[../frontend/caja]] | [[../frontend/historial-caja]]
**Depende de:** [[facturacion]] · [[turnos]]
**Nota clave:** [[facturacion]] actualiza las columnas `ventasEfectivo`/`ventasTransferencia` de esta tabla al crear cada factura

**Archivos:**
- `backend/src/modules/caja/caja.service.ts`
- `backend/src/modules/caja/caja.controller.ts`

El módulo más complejo del sistema. Controla la caja diaria con apertura, cierre, gastos, ingresos y el resumen financiero.
Solo accesible para admins.

Todos los métodos reciben `tenantId` — cada lavadero tiene su propia caja independiente.

---

## Controller — endpoints

**Prefijo de ruta:** `/api/caja`
**Guards globales:** `JwtAuthGuard` + `RolesGuard(admin)`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/estado` | Estado actual: ¿hay caja hoy? ¿hay alguna sin cerrar? |
| `POST` | `/abrir` | Abrir la caja del día |
| `GET` | `/resumen/:cajaDiaId` | Calcular resumen completo de una caja |
| `POST` | `/cerrar/:cajaDiaId` | Cerrar una caja |
| `POST` | `/gastos` | Registrar un gasto en la caja abierta |
| `DELETE` | `/gastos/:id` | Eliminar un gasto |
| `POST` | `/ingresos-manuales` | Registrar un ingreso manual |
| `DELETE` | `/ingresos-manuales/:id` | Eliminar un ingreso manual |
| `GET` | `/historial` | Listar las últimas 30 cajas cerradas |
| `GET` | `/facturas/:cajaDiaId` | Listar facturas de un día específico |

El decorator `@UsuarioActual()` extrae el usuario del JWT para saber quién hizo cada acción.

---

## Service — constructor (dependencias)

| Dependencia | Para qué |
|-------------|----------|
| `cajaDiaRepo` | Tabla `caja_dia` |
| `gastoCajaRepo` | Tabla `gasto_caja` |
| `ingresoManualRepo` | Tabla `ingreso_manual_caja` |
| `facturaRepo` | Tabla `factura` (para el resumen y listado) |
| `turnoRepo` | Tabla `turno` (para calcular ganancias por trabajador) |

---

## Service — métodos

### `fechaHoy()` *(privado)* — fecha actual en Colombia
Usa `Intl.DateTimeFormat` con timezone `'America/Bogota'` para obtener `YYYY-MM-DD`.
Todos los métodos que necesitan "la fecha de hoy" usan este helper.

---

### `obtenerEstado(tenantId)` — estado actual de la caja
Ejecuta en paralelo, filtrando por `tenantId`:
1. Busca si hay una caja con `fecha === hoy`
2. Busca si hay una caja con `estado = ABIERTA` y `fecha ≠ hoy` (anterior sin cerrar)

Devuelve `{ cajaHoy, cajaSinCerrar }`.

---

### `abrir(dto, usuarioId, tenantId)` — abrir la caja del día
**Validaciones** (todas filtradas por `tenantId`):
1. Si ya existe una caja para hoy en este tenant: `ConflictException`
2. Si hay una caja abierta de otro día en este tenant: `BadRequestException` (debe cerrarla primero)

Crea la caja con: fecha de hoy, monto inicial, estado `ABIERTA`, usuarioAperturaId, fechaApertura, **tenantId**.

---

### `calcularResumen(cajaDiaId, tenantId)` — el método más complejo
Calcula el resumen financiero completo de un día. Ejecuta 4 queries en paralelo:

1. **Turnos completados del día** — con JOIN a trabajador y servicio (para calcular comisiones)
   - Filtra por `fechaHora >= fecha::date AND fechaHora < fecha::date + 1 day`
   - Solo incluye turnos `completado`

2. **Gastos** — todos los de esa caja

3. **Ingresos manuales** — todos los de esa caja

4. **Facturas del día** — con JOINs a turno, cliente, vehículo, servicio, trabajador
   - Filtra por `fechaEmision` en rango UTC-5 del día

Las ventas (`ventasEfectivo`, `ventasTransferencia`) se leen directamente de las **columnas pre-computadas** de `CajaDia` (no se calculan sumando facturas).

**Cálculo de ganancias por trabajador:**
- Agrupa los turnos por trabajador usando un `Map`
- Para cada trabajador: suma los precios de sus servicios × su `comisionPorcentaje`

**Cálculo final:**
```
totalVentas = ventasEfectivo + ventasTransferencia + ingresosManual
totalGastos = gastosEfectivo + gastosTransferencia
gananciaLavadero = totalVentas - totalGananciaEmpleados
totalDia = montoInicial + gananciaLavadero - totalGastos
```

---

### `listarFacturasDia(cajaDiaId, tenantId)` — facturas de un día
Busca la caja, luego trae las facturas de ese día con todos los JOINs.
Mismo rango de fechas UTC-5 que en `calcularResumen`.

---

### `cerrar(cajaDiaId, usuarioId, tenantId)` — cerrar la caja
Si ya está cerrada: `BadRequestException`.
Cambia `estado = CERRADA`, guarda `usuarioCierreId` y `fechaCierre`.

---

### `registrarGasto(dto, usuarioId, tenantId)` — registrar un gasto
Verifica que haya una caja abierta HOY en este tenant.
Crea el gasto asociado a esa caja, al usuario y con `tenantId`.

---

### `eliminarGasto(gastoId, tenantId)` — eliminar un gasto
Busca el gasto filtrando por `id` Y `tenantId`, luego la caja a la que pertenece.
Si la caja está cerrada: `BadRequestException` (no se puede modificar historia).
Elimina con `repo.remove()`.

---

### `registrarIngresoManual(dto, usuarioId, tenantId)` — registrar ingreso extra
Igual que `registrarGasto` pero para ingresos manuales.

---

### `eliminarIngresoManual(id, tenantId)` — eliminar ingreso manual
Igual que `eliminarGasto` con la misma validación de caja cerrada.

---

### `historial(tenantId, limit = 30)` — listar cajas cerradas del tenant
Devuelve las últimas `limit` cajas del tenant con `estado = CERRADA`.
Ordena por `fecha DESC`.
Carga las relaciones: `usuarioApertura`, `usuarioCierre` (para saber quién abrió/cerró).
