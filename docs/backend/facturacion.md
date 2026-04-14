# Facturación — módulo de facturación

**Ver también:** [[_indice]] | [[../04 - El backend]] | [[../frontend/facturacion]] | [[../frontend/turnos]]
**Depende de:** [[turnos]] · [[caja]]
**Efecto secundario:** al crear una factura, actualiza las columnas pre-computadas de [[caja]]

**Archivos:**
- `backend/src/modules/facturacion/facturacion.service.ts`
- `backend/src/modules/facturacion/facturacion.controller.ts`

Genera y consulta facturas. Solo admins pueden acceder.

Todos los métodos reciben `tenantId`. Al crear una factura, la caja que se actualiza también se filtra por tenant.

---

## Controller — endpoints

**Prefijo de ruta:** `/api/facturacion`
**Guards globales:** `JwtAuthGuard` + `RolesGuard(admin)`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Crear factura |
| `GET` | `/` | Listar (query: `fechaDesde`, `fechaHasta`) |
| `GET` | `/:id` | Buscar por ID |
| `GET` | `/turno/:turnoId` | Buscar la factura de un turno |

---

## Service — constructor (dependencias)

| Dependencia | Para qué |
|-------------|----------|
| `repo` (Repository&lt;Factura&gt;) | Tabla `factura` |
| `cajaDiaRepo` (Repository&lt;CajaDia&gt;) | Actualizar columnas pre-computadas de la caja al cobrar |
| `TurnosService` | Validar estado del turno antes de facturar |

---

## Service — métodos

### `crear(dto, tenantId)` — crear una factura
Realiza **2 validaciones** antes de crear:
1. El turno existe (en este tenant) y está en estado `completado`. Si no: `BadRequestException`
2. El turno no tiene ya una factura → `ConflictException`

Crea y guarda la factura con `tenantId`.

**Efecto secundario — actualiza la caja del tenant:**
Busca la caja abierta del día filtrando por `estado = ABIERTA` Y `tenantId`.
Si existe:
- Si `metodoPago === 'efectivo'`: incrementa `ventasEfectivo` en la caja
- Si es cualquier otro método: incrementa `ventasTransferencia`
Usa `cajaDiaRepo.increment({ id }, campo, monto)` (TypeORM actualiza directo sin hacer fetch+save).

> Este mecanismo hace que el resumen de caja sea muy rápido: lee `ventasEfectivo` y `ventasTransferencia` directamente de la columna sin sumar todas las facturas.

---

### `buscarTodas(tenantId, fechaDesde?, fechaHasta?)` — listar facturas con rango de fechas opcional
Si se pasan ambas fechas: filtra `fechaEmision` entre:
```
YYYY-MM-DDT00:00:00-05:00   (inicio del día en Colombia)
YYYY-MM-DDT23:59:59-05:00   (fin del día en Colombia)
```
Carga relaciones: `turno → cliente, vehiculo, servicio`.
Ordena por `fechaEmision DESC`.

---

### `buscarPorId(id, tenantId)` — buscar factura por ID
Filtra por `id` Y `tenantId`. Si no existe: `NotFoundException`.
Carga las mismas relaciones que `buscarTodas`.

---

### `buscarPorTurno(turnoId, tenantId)` — buscar la factura de un turno específico
Filtra por `turnoId` Y `tenantId`. Si no existe: `NotFoundException`.
Carga las mismas relaciones.
