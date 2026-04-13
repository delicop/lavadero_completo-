# Clientes — módulo de clientes

**Ver también:** [[_indice]] | [[../04 - El backend]] | [[../frontend/clientes]]
**Usado por:** [[turnos]] · [[vehiculos]]

**Archivos:**
- `backend/src/modules/clientes/clientes.service.ts`
- `backend/src/modules/clientes/clientes.controller.ts`

CRUD de clientes del lavadero. Requiere estar autenticado (cualquier rol puede leer).

---

## Controller — endpoints

**Prefijo de ruta:** `/api/clientes`
**Guard global:** `JwtAuthGuard` (cualquier usuario autenticado)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Crear cliente |
| `GET` | `/` | Listar todos (orden: apellido, nombre) |
| `GET` | `/:id` | Buscar por ID |
| `PATCH` | `/:id` | Actualizar |
| `DELETE` | `/:id` | Eliminar permanentemente |

---

## Service — constructor

| Dependencia | Para qué |
|-------------|----------|
| `repo` (Repository&lt;Cliente&gt;) | Tabla `cliente` |

---

## Service — métodos

### `crear(dto)` — crear un cliente
Si `dto.email` tiene valor: verifica que no exista otro cliente con ese email → `ConflictException`.
Crea el cliente. Si `email` no viene: se guarda como `null`.

---

### `buscarTodos()` — listar todos
Ordena por `apellido ASC, nombre ASC` (orden alfabético).

---

### `buscarPorId(id)` — buscar por ID
Si no existe: `NotFoundException`.

---

### `actualizar(id, dto)` — actualizar cliente
Primero busca el cliente con `buscarPorId()`.
Si el DTO trae un email diferente al actual: verifica que no esté en uso → `ConflictException`.
Aplica los cambios con `Object.assign(cliente, dto)` y guarda.

---

### `eliminar(id)` — eliminar cliente
Busca y elimina con `repo.remove()`.

> ⚠️ Si el cliente tiene vehículos con turnos asociados, la base de datos puede rechazar la eliminación por restricción de FK. Habría que manejarlo con `cascade` o desactivación lógica en el futuro.
