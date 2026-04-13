# Auth — módulo de autenticación

**Ver también:** [[_indice]] | [[../04 - El backend]] | [[../frontend/asistencia]] | [[../frontend/mi-perfil]]
**Depende de:** [[usuarios]]

**Archivos:**
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.controller.ts`

Maneja el login, cambio de contraseña, disponibilidad del trabajador e historial de accesos.

---

## Controller — endpoints

**Prefijo de ruta:** `/api/auth`

| Método | Ruta | Guard | Descripción |
|--------|------|-------|-------------|
| `POST` | `/login` | *(ninguno)* | Inicia sesión. Devuelve el JWT |
| `GET` | `/me` | `JwtAuthGuard` | Devuelve los datos del usuario logueado |
| `PATCH` | `/cambiar-password` | `JwtAuthGuard` | Cambia la contraseña del usuario logueado |
| `PATCH` | `/disponibilidad` | `JwtAuthGuard` | Cambia si el trabajador está disponible o no |
| `GET` | `/historial` | `JwtAuthGuard` + `RolesGuard(admin)` | Historial de logins |

---

## Service — constructor (dependencias)

| Dependencia | Para qué |
|-------------|----------|
| `UsuariosService` | Buscar usuario por email/ID, actualizar password hash y disponibilidad |
| `JwtService` | Firmar el token JWT |
| `EventsGateway` | Emitir el evento WebSocket cuando cambia la disponibilidad |
| `loginLogRepo` | Repositorio de `LoginLog` para registrar los accesos |

---

## Service — métodos

### `login(dto)` — iniciar sesión
1. Busca el usuario por email con `usuariosService.buscarPorEmailConPassword()` (trae el hash)
2. Si no existe o está inactivo (`activo === false`): lanza `UnauthorizedException`
3. Compara la contraseña enviada con el hash usando `bcrypt.compare()`
4. Si no coincide: lanza `UnauthorizedException`
5. Registra el acceso creando un `LoginLog` con: usuarioId, email, nombre completo, rol
6. Firma el JWT con payload `{ sub: usuario.id, rol: usuario.rol }`
7. Devuelve `{ accessToken }`

**Importante:** tanto "usuario no existe" como "contraseña incorrecta" devuelven el mismo error (`"Credenciales inválidas"`) para no revelar si el email existe.

---

### `cambiarPassword(usuarioId, dto)` — cambiar la propia contraseña
1. Busca el usuario con `buscarPorIdConPassword()` para tener el hash actual
2. Verifica que `dto.passwordActual` coincida con el hash usando `bcrypt.compare()`
3. Si no coincide: lanza `UnauthorizedException`
4. Hashea la nueva contraseña con `bcrypt.hash(dto.passwordNueva, 10)`
5. Llama a `usuariosService.actualizarPasswordHash(usuarioId, nuevoHash)`

---

### `actualizarDisponibilidad(usuarioId, disponible)` — toggle disponibilidad
1. Llama a `usuariosService.actualizarDisponibilidad(usuarioId, disponible)`
2. Emite el evento WebSocket `usuario_actualizado` con `eventsGateway.emitirUsuarioActualizado(usuarioId, disponible)`
   → Esto hace que todos los navegadores conectados actualicen la UI en tiempo real.

---

### `historialLogin(limit)` — historial de accesos
Busca en `loginLogRepo` los últimos `limit` registros ordenados por `fechaHora DESC`.
Devuelve quién entró, cuándo y con qué rol.
