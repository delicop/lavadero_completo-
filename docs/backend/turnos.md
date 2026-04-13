# Turnos — módulo de turnos

**Ver también:** [[_indice]] | [[../04 - El backend]] | [[../frontend/turnos]] | [[../frontend/dashboard]]
**Depende de:** [[clientes]] · [[vehiculos]] · [[servicios]] · [[usuarios]]
**Usado por:** [[facturacion]] · [[caja]] · [[liquidaciones]]

**Archivos:**
- `backend/src/modules/turnos/turnos.service.ts`
- `backend/src/modules/turnos/turnos.controller.ts`

El módulo más central del sistema. Maneja la creación, listado y cambio de estado de los turnos.

---

## Controller — endpoints

**Prefijo de ruta:** `/api/turnos`
**Guard global:** `JwtAuthGuard` (todos los autenticados)

| Método | Ruta | Guard extra | Descripción |
|--------|------|-------------|-------------|
| `POST` | `/` | — | Crear turno |
| `GET` | `/` | — | Listar (query: `estado`, `fechaDesde`, `fechaHasta`) |
| `GET` | `/:id` | — | Buscar por ID |
| `GET` | `/trabajador/:trabajadorId` | — | Turnos de un trabajador (query: `fechaDesde`, `fechaHasta`) |
| `PATCH` | `/:id` | — | Actualizar datos (solo si está `pendiente`) |
| `PATCH` | `/:id/estado` | — | Cambiar estado |
| `DELETE` | `/:id` | `RolesGuard(admin)` | Eliminar (solo admin) |

---

## Service — constructor (dependencias)

| Dependencia | Para qué |
|-------------|----------|
| `repo` (Repository&lt;Turno&gt;) | Tabla `turno` |
| `ClientesService` | Validar que el cliente existe |
| `VehiculosService` | Validar que el vehículo existe y pertenece al cliente |
| `ServiciosService` | Validar que el servicio existe y está activo |
| `UsuariosService` | Validar que el trabajador existe |
| `EventsGateway` | Emitir evento WebSocket al cambiar estado |

---

## Service — métodos

### `crear(dto)` — crear un turno
Realiza **5 validaciones** antes de crear:
1. El cliente existe (`clientesService.buscarPorId()`)
2. El trabajador existe (`usuariosService.buscarPorId()`)
3. El vehículo existe Y pertenece al cliente → `BadRequestException` si no coincide
4. El vehículo no tiene ya un turno `pendiente` o `en_proceso` activo → `BadRequestException`
5. El servicio existe Y está activo → `BadRequestException` si no

Si pasa todas las validaciones: crea el turno con `fechaHora` convertida a `Date`.

---

### `buscarTodos(estado?, fechaDesde?, fechaHasta?)` — listar turnos con filtros opcionales
Si se pasan fechas: aplica `Between` con timezone Colombia (UTC-5):
```
fechaHora >= YYYY-MM-DDT00:00:00-05:00
fechaHora <= YYYY-MM-DDT23:59:59-05:00
```
Carga las relaciones: `cliente`, `vehiculo`, `servicio`, `trabajador`.
Ordena por `fechaHora DESC`.

---

### `buscarPorId(id)` — buscar uno con todas sus relaciones
Si no existe: `NotFoundException`.
Carga: `cliente`, `vehiculo`, `servicio`, `trabajador`.

---

### `buscarPorTrabajador(trabajadorId, fechaDesde?, fechaHasta?)` — turnos de un trabajador
Igual que `buscarTodos` pero filtra por `trabajadorId`.
Ordena por `fechaHora ASC` (para mostrar en orden cronológico al trabajador).
No carga la relación `trabajador` (ya se sabe quién es).

---

### `actualizar(id, dto)` — actualizar datos del turno
Solo se puede si el estado es `pendiente`. Si no: `BadRequestException`.
Puede actualizar: `trabajadorId`, `fechaHora`, `observaciones`.
Si cambia `trabajadorId`: valida que el nuevo trabajador existe.

---

### `cambiarEstado(id, dto)` — cambiar el estado del turno
1. Busca el turno
2. Consulta `TRANSICIONES_VALIDAS[turno.estado]` (definido en la entidad) para saber si el cambio es válido
3. Si no está permitido: `BadRequestException` con mensaje descriptivo
4. Guarda el nuevo estado
5. Emite el evento WebSocket: `eventsGateway.emitirTurnoActualizado(id, nuevoEstado)`
   → Todos los navegadores conectados actualizan sus pantallas.

**Transiciones válidas:**
- `pendiente → en_proceso, cancelado`
- `en_proceso → completado, cancelado`
- `completado → (ninguna)`
- `cancelado → (ninguna)`

---

### `eliminar(id)` — eliminar un turno
No se puede eliminar un turno `en_proceso` → `BadRequestException`.
Para los demás estados, elimina con `repo.remove()`.
