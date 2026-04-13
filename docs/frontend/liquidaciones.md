# Liquidaciones — `liquidaciones.component.ts`

**Ruta:** `/liquidaciones`
**Archivo:** `frontangular/src/app/pages/liquidaciones/liquidaciones.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]]
**Módulos backend que usa:** [[../backend/usuarios]] · [[../backend/turnos]]

Calcula y registra los pagos a los empleados por sus servicios en un período.

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `svc` | `LiquidacionService` | CRUD de liquidaciones y detalle de turnos |
| `usuarioSvc` | `UsuarioService` | Lista de trabajadores para el select |

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `liquidaciones` | `Liquidacion[]` | Lista de todas las liquidaciones |
| `trabajadores` | `Usuario[]` | Empleados activos para el select del formulario |
| `cargando` | `boolean` | Carga inicial |
| `mostrarForm` | `boolean` | Visibilidad del modal de nueva liquidación |
| `errorForm` | `string` | Error dentro del modal |
| `detalle` | `Liquidacion \| null` | Liquidación seleccionada para ver el detalle |
| `detalleTurnos` | `Turno[]` | Turnos incluidos en la liquidación del detalle |
| `cargandoDetalle` | `boolean` | Indica que se están cargando los turnos del detalle |
| `form` | `object` | Campos: `trabajadorId, fechaDesde, fechaHasta` |

---

## Métodos

### `ngOnInit()`
Carga en paralelo `cargar()` y `cargarTrabajadores()`.

---

### `cargar()` — cargar lista de liquidaciones
Llama a `svc.listar()`.

---

### `cargarTrabajadores()` — cargar trabajadores para el select
Llama a `usuarioSvc.listar()` y filtra los activos (`u.activo`).
Incluye tanto admins como trabajadores (por si un admin también tiene comisión).

---

### `abrirForm()` — abrir modal de nueva liquidación
Resetea el `form` y limpia el error.

---

### `cerrarForm()` — cerrar modal sin guardar

---

### `guardar()` — calcular y crear la liquidación
Llama a `svc.crear({ trabajadorId, fechaDesde, fechaHasta })`.
El backend calcula automáticamente los turnos, la comisión y el total.
Si tiene éxito: cierra el modal y recarga.
Si falla: muestra error.

---

### `verDetalle(liq)` — ver los turnos de una liquidación
Guarda `detalle = liq` y setea `cargandoDetalle = true`.
Llama a `svc.turnosDeLiquidacion(liq.id)` para traer el listado de turnos.
**Llamado por:** botón "Ver detalle" en cada fila.

---

### `cerrarDetalle()` — cerrar el panel de detalle
Limpia `detalle` y `detalleTurnos`.

---

### `marcarPagada(id)` — registrar que se pagó una liquidación
Pide confirmación con `confirm()`.
Llama a `svc.marcarPagada(id)` y recarga.
**Llamado por:** botón "Marcar como pagada" en las liquidaciones pendientes.

---

### `comisionTurno(t, pct)` — calcular la comisión de un turno
Fórmula: `precio_del_servicio × (pct / 100)`.
**Llamado por:** el template para mostrar la ganancia de cada turno en el detalle.
