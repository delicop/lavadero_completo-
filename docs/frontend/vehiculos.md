# Vehículos — `vehiculos.component.ts`

**Ruta:** `/vehiculos`
**Archivo:** `frontangular/src/app/pages/vehiculos/vehiculos.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]] | [[clientes]]
**Módulos backend que usa:** [[../backend/vehiculos]] · [[../backend/clientes]]

CRUD de vehículos. Cada vehículo pertenece a un cliente.

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `svc` | `VehiculoService` | CRUD de vehículos |
| `clienteSvc` | `ClienteService` | Listar clientes para el select del formulario |

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `vehiculos` | `Vehiculo[]` | Lista completa cargada desde la API |
| `clientes` | `Cliente[]` | Lista de clientes para el select "Propietario" |
| `cargando` | `boolean` | Indicador de carga |
| `mostrarForm` | `boolean` | Visibilidad del modal |
| `editandoId` | `string \| null` | `null` = crear, valor = editar |
| `errorForm` | `string` | Error dentro del modal |
| `form` | `object` | Campos: `clienteId, placa, marca, modelo, color, tipo` |
| `tipoLabel` | `Record<TipoVehiculo, string>` | Diccionario para mostrar el tipo en español |

---

## Métodos

### `ngOnInit()`
Carga en paralelo `cargar()` y `cargarClientes()`.

---

### `cargar()` — cargar todos los vehículos
Llama a `svc.listar()` y asigna a `vehiculos`.

---

### `cargarClientes()` — cargar lista de clientes
Llama a `clienteSvc.listar()` y asigna a `clientes`.
Usado para el select de "Propietario" en el formulario.

---

### `abrirNuevo()` — modal en modo crear
Resetea `form` con `tipo = 'auto'` por defecto.

---

### `abrirEditar(v)` — modal en modo editar
Pre-carga el `form` con los datos del vehículo recibido.

---

### `cerrarForm()` — cerrar modal sin guardar

---

### `guardar()` — crear o actualizar
Antes de enviar, convierte `placa` a mayúsculas: `placa.toUpperCase()`.
Determina si crear o actualizar según `editandoId`.
Si tiene éxito: cierra y recarga.
**Llamado por:** botón "Guardar" del modal.

---

### `eliminar(id)` — eliminar vehículo
Pide confirmación, llama a `svc.eliminar(id)` y recarga.
