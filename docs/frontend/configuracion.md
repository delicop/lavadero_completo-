# Personal / Configuración — `configuracion.component.ts`

**Ver también:** [[../03 - Las páginas]] | [[_indice]] | [[asistencia]]
**Módulo backend que usa:** [[../backend/usuarios]]


**Ruta:** `/configuracion`
**Label en sidebar:** "Personal"
**Archivo:** `frontangular/src/app/pages/configuracion/configuracion.component.ts`

Gestión de los empleados del lavadero. Permite crear, editar, activar/desactivar.
Solo accesible para admins.

---

## Servicio inyectado

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `svc` | `UsuarioService` | CRUD de usuarios (empleados) |

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `usuarios` | `Usuario[]` | Lista de todos los usuarios del sistema |
| `cargando` | `boolean` | Indicador de carga |
| `mostrarForm` | `boolean` | Visibilidad del modal |
| `editandoId` | `string \| null` | `null` = crear, valor = editar |
| `errorForm` | `string` | Error dentro del modal |
| `form` | `object` | Campos: `nombre, apellido, email, password, rol, comisionPorcentaje` |

---

## Getter

### `esAdmin`
Devuelve `true` si `form.rol === 'admin'`.
**Usado en:** el template para ocultar el campo `comisionPorcentaje` cuando el rol es admin
(los admins no tienen comisión).

---

## Métodos

### `ngOnInit()`
Llama a `cargar()`.

---

### `cargar()` — cargar lista de usuarios
Llama a `svc.listar()`.

---

### `abrirNuevo()` — modal en modo crear
Resetea el `form` con rol `trabajador` y comisión `50` como defaults.
El campo `email` solo aparece en modo crear (no se puede cambiar el email de un usuario existente).

---

### `abrirEditar(u)` — modal en modo editar
Pre-carga los datos del usuario. El campo `password` se deja vacío (el admin solo lo llena si quiere cambiarlo).

---

### `cerrarForm()` — cerrar modal

---

### `guardar()` — crear o actualizar
**Modo crear:** envía todos los campos incluyendo `email` y `password`.
Si el rol no es admin, incluye `comisionPorcentaje`.

**Modo editar:** envía solo `nombre`, `apellido`, `rol`.
- Si no es admin, agrega `comisionPorcentaje`.
- Si se escribió algo en `password`, lo agrega (permite cambiar la contraseña desde acá).
- El `email` no se puede cambiar en modo editar.

**Llamado por:** botón "Guardar" del modal.

---

### `toggleActivo(u)` — activar o desactivar un empleado
Llama a `svc.actualizar(u.id, { activo: !u.activo })` y recarga.
Un empleado inactivo no puede iniciar sesión.
**Llamado por:** switch en cada fila de la tabla.
