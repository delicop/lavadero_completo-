# Servicios — `servicios.component.ts`

**Ruta:** `/servicios`
**Archivo:** `frontangular/src/app/pages/servicios/servicios.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]]
**Módulo backend que usa:** [[../backend/servicios]]

CRUD de los tipos de lavado que ofrece el negocio. Incluye activar/desactivar.

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `svc` | `ServicioService` | CRUD de servicios |
| `cdr` | `ChangeDetectorRef` | Forzar actualización de la vista después de cargar |

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `servicios` | `Servicio[]` | Lista de todos los servicios (activos e inactivos) |
| `cargando` | `boolean` | Indicador de carga |
| `mostrarForm` | `boolean` | Visibilidad del modal |
| `editandoId` | `string \| null` | `null` = crear, valor = editar |
| `errorForm` | `string` | Error dentro del modal |
| `form` | `object` | Campos: `tipoVehiculo, nombre, descripcion, duracionMinutos, precio` |

---

## Métodos

### `ngOnInit()`
Llama a `cargar()`.

---

### `cargar()` — cargar todos los servicios
Llama a `svc.listarTodos()` (trae activos e inactivos, a diferencia de `listar()` que solo trae los activos).
Llama a `cdr.detectChanges()` al terminar.

---

### `abrirNuevo()` — modal en modo crear
Resetea el `form` con `duracionMinutos = 30` y `precio = 0` como defaults.

---

### `abrirEditar(s)` — modal en modo editar
Pre-carga el `form` con los datos del servicio.
Si `descripcion` es `null`, lo convierte a `''` para el input.

---

### `cerrarForm()` — cerrar modal

---

### `guardar()` — crear o actualizar
Si `descripcion` está vacía la envía como `null` (el backend la acepta como opcional).
Crea o actualiza según `editandoId`.
**Llamado por:** botón "Guardar" del modal.

---

### `toggleActivo(s)` — activar/desactivar un servicio
Llama a `svc.actualizar(s.id, { activo: !s.activo })` y recarga.
**Llamado por:** switch/botón en cada fila de la tabla.

---

### `eliminar(id)` — eliminar servicio
Pide confirmación, llama a `svc.eliminar(id)` y recarga.
