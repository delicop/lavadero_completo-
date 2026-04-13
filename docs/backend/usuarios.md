# Usuarios — módulo de personal

**Ver también:** [[_indice]] | [[../04 - El backend]] | [[../frontend/configuracion]] | [[../frontend/asistencia]]
**Usado por:** [[auth]] · [[turnos]] · [[liquidaciones]]

**Archivos:**
- `backend/src/modules/usuarios/usuarios.service.ts`
- `backend/src/modules/usuarios/usuarios.controller.ts`

Gestión de los empleados del lavadero. Todos los endpoints requieren rol `admin`.

---

## Controller — endpoints

**Prefijo de ruta:** `/api/usuarios`
**Guards globales:** `JwtAuthGuard` + `RolesGuard(admin)`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Crear nuevo usuario |
| `GET` | `/` | Listar todos |
| `GET` | `/:id` | Buscar por ID |
| `PATCH` | `/:id` | Actualizar (nombre, rol, comisión, activo, password) |
| `DELETE` | `/:id` | Eliminar permanentemente |

---

## Service — constructor (dependencias)

| Dependencia | Para qué |
|-------------|----------|
| `repo` (Repository&lt;Usuario&gt;) | Acceso a la tabla `usuario` en la base de datos |

---

## Service — métodos

### `crear(dto)` — crear un nuevo empleado
1. Verifica que no haya otro usuario con el mismo email → `ConflictException`
2. Hashea la contraseña con `bcrypt.hash(dto.password, 10)` (costo 10 = balance seguridad/velocidad)
3. Crea y guarda el usuario
4. Devuelve el usuario **sin** el campo `passwordHash` (llama a `omitirPassword()`)

---

### `buscarTodos()` — listar todos los empleados
Devuelve ordenados por `fechaRegistro DESC` (los más nuevos primero).
Omite `passwordHash` de cada usuario.

---

### `buscarPorId(id)` — buscar un empleado por ID
Si no existe: lanza `NotFoundException`.
Devuelve sin `passwordHash`.

---

### `buscarPorEmailConPassword(email)` — buscar con el hash (uso interno del auth)
**Solo para uso del AuthService.** Devuelve el usuario completo incluyendo `passwordHash`.
Devuelve `null` si no existe.

---

### `buscarPorIdConPassword(id)` — buscar con el hash por ID (uso interno)
**Solo para uso del AuthService.** Igual que el anterior pero busca por ID.

---

### `actualizarPasswordHash(id, hash)` — actualizar solo el hash
Hace un `UPDATE` directo con `repo.update()`. No busca el usuario completo.
**Solo para uso del AuthService.**

---

### `actualizarDisponibilidad(id, disponible)` — cambiar disponibilidad
Hace un `UPDATE` directo. Usado por el AuthService cuando un trabajador cambia su disponibilidad.

---

### `actualizar(id, dto)` — actualizar datos del empleado
Busca el usuario, aplica los cambios:
- Si `dto.password` tiene valor: hashea y reemplaza `passwordHash`
- Actualiza `nombre`, `apellido`, `rol`, `activo`, `comisionPorcentaje` (solo si vienen en el DTO)
Guarda y devuelve sin `passwordHash`.

---

### `eliminar(id)` — eliminar permanentemente
Busca el usuario, si no existe: `NotFoundException`.
Lo elimina con `repo.remove()`.

> ⚠️ Es una eliminación permanente. En producción sería mejor solo desactivarlo (`activo = false`).

---

### `omitirPassword(usuario)` *(privado)* — quitar el hash de la respuesta
Usa destructuring para excluir `passwordHash`:
```typescript
const { passwordHash: _, ...resto } = usuario;
return resto;
```
Se llama en todos los métodos públicos para garantizar que el hash nunca salga en la respuesta.
