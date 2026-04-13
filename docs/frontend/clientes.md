# Clientes — `clientes.component.ts`

**Ruta:** `/clientes`
**Archivo:** `frontangular/src/app/pages/clientes/clientes.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]] | [[vehiculos]]
**Módulo backend que usa:** [[../backend/clientes]]

CRUD de clientes. Permite listar, crear, editar y eliminar clientes del lavadero.

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `svc` | `ClienteService` | Todas las operaciones con la API de clientes |

## Utilidades importadas
- `formatFecha` — formatea fechas para mostrar en la tabla

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `clientes` | `Cliente[]` | Lista cargada desde la API |
| `cargando` | `boolean` | Indicador de carga inicial |
| `error` | `string` | Error general de la página |
| `mostrarForm` | `boolean` | Controla la visibilidad del modal |
| `editandoId` | `string \| null` | Si es `null` → modo crear. Si tiene valor → modo editar |
| `errorForm` | `string` | Error dentro del modal |
| `form` | `object` | Campos del formulario: `nombre, apellido, telefono, email` |

---

## Métodos

### `ngOnInit()`
Llama a `cargar()`.

---

### `cargar()` — cargar la lista
Llama a `svc.listar()`.
Si falla: muestra `"Error al cargar clientes"`.
**Llamado por:** `ngOnInit` y después de cada operación CRUD.

---

### `abrirNuevo()` — abrir modal en modo crear
Setea `editandoId = null`, resetea el `form` a vacío, limpia `errorForm`, muestra el modal.
**Llamado por:** botón "Nuevo cliente".

---

### `abrirEditar(c)` — abrir modal en modo editar
Setea `editandoId = c.id`.
Pre-carga el `form` con los datos del cliente recibido.
**Llamado por:** botón "Editar" en cada fila de la tabla.

---

### `cerrarForm()` — cerrar el modal sin guardar
Oculta el modal y resetea `editandoId`.

---

### `guardar()` — crear o actualizar
Determina si es creación o edición por el valor de `editandoId`:
- Si `editandoId === null`: llama a `svc.crear(payload)`
- Si tiene valor: llama a `svc.actualizar(editandoId, payload)`

El email se envía como `undefined` si el campo está vacío (el backend lo acepta como opcional).
Si tiene éxito: cierra el modal y recarga la lista.
Si falla: muestra el error en `errorForm`.
**Llamado por:** botón "Guardar" del modal.

---

### `eliminar(id)` — eliminar cliente
Pide confirmación con `confirm()`.
Llama a `svc.eliminar(id)` y recarga la lista.
**Llamado por:** botón "Eliminar" en cada fila.
