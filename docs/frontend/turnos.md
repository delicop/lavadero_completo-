# Turnos — `turnos.component.ts`

**Ruta:** `/turnos`
**Archivo:** `frontangular/src/app/pages/turnos/turnos.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]]
**Módulos backend que usa:** [[../backend/turnos]] · [[../backend/facturacion]] · [[../backend/caja]] · [[../backend/usuarios]]

Lista completa de todos los turnos con filtros. Permite crear turnos, cambiar estados, completar y cobrar.

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `turnoSvc` | `TurnoService` | Listar, crear, cambiar estado |
| `clienteSvc` | `ClienteService` | Lista de clientes para el formulario |
| `vehiculoSvc` | `VehiculoService` | Vehículos según el cliente elegido |
| `servicioSvc` | `ServicioService` | Lista de servicios activos |
| `usuarioSvc` | `UsuarioService` | Lista de trabajadores para select y filtro |
| `facturaSvc` | `FacturacionService` | Listar facturas (para saber cuáles ya están cobradas) y crear nuevas |
| `cajaService` | `CajaService` | Verificar si la caja está abierta (habilita el botón cobrar) |
| `realtime` | `RealtimeService` | Escucha `onTurnoActualizado$` para auto-refrescar |
| `cdr` | `ChangeDetectorRef` | Forzar actualización de la vista |

---

## Constantes del módulo (fuera de la clase)

| Nombre | Qué es |
|--------|--------|
| `TRANSICIONES` | Mapa de transiciones válidas por estado: ej `pendiente → ['en_proceso', 'cancelado']` |
| `ESTADO_LABEL` | Diccionario `EstadoTurno → string legible` |
| `METODO_LABEL` | Diccionario `MetodoPago → string legible` |
| `METODOS` | Array con los 4 métodos de pago |

---

## Propiedades de la clase

### Datos principales
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `cajaAbierta` | `boolean` | Si hay caja abierta hoy. Habilita el botón "Cobrar" |
| `sub` | `Subscription \| null` (privado) | Suscripción al WebSocket |
| `clientesMap` | `Map<string, Cliente>` (privado) | Lookup de cliente por ID para WhatsApp |
| `vehiculosMap` | `Map<string, Vehiculo>` (privado) | Lookup de vehículo por ID para WhatsApp |
| `turnos` | `Turno[]` | Lista cargada desde la API |
| `clientes` | `Cliente[]` | Para el select del formulario |
| `vehiculosCliente` | `Vehiculo[]` | Vehículos del cliente seleccionado en el form |
| `servicios` | `Servicio[]` | Para el select del formulario |
| `trabajadores` | `Usuario[]` | Trabajadores activos y disponibles |

### Filtros que se mandan al backend
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `filtroDesde` | `string` | Fecha desde (default: hoy) |
| `filtroHasta` | `string` | Fecha hasta (default: hoy) |
| `filtroEstado` | `EstadoTurno \| ''` | Estado a filtrar ('' = todos) |

### Filtros locales (se aplican sobre los datos ya cargados)
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `filtroBusqueda` | `string` | Busca por nombre de cliente o placa |
| `filtroTrabajadorId` | `string` | Filtra por trabajador |

### Estado de UI
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `cargando` | `boolean` | Indicador de carga |
| `mostrarForm` | `boolean` | Muestra/oculta el modal de nuevo turno |
| `errorForm` | `string` | Error al guardar el formulario |

### Modal cobro
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `mostrarModalCompletar` | `boolean` | Muestra el modal de cobro |
| `ordenACompletar` | `Turno \| null` | El turno que se está cobrando |
| `metodoPago` | `MetodoPago` | Selección del método de pago |
| `totalFactura` | `number` | Monto editable (pre-carga el precio del servicio) |
| `errorCompletar` | `string` | Error del modal de cobro |
| `guardandoCompletar` | `boolean` | Previene doble-click |
| `facturaGenerada` | `Factura \| null` | Factura recién creada para mostrar en vista previa |
| `turnosConFactura` | `Set<string>` | IDs de turnos que ya tienen factura |

### Formulario nuevo turno
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `form` | `object` | `clienteId, vehiculoId, servicioId, trabajadorId, fechaHora, observaciones` |

---

## Getter

### `turnosVisibles`
Aplica los filtros locales (`filtroBusqueda` y `filtroTrabajadorId`) sobre el array `turnos`.
- Si hay texto de búsqueda: filtra por nombre, apellido o placa (case insensitive)
- Si hay trabajador seleccionado: filtra por `trabajadorId`
**Llamado por:** el `@for` del template para renderizar la tabla.

---

## Métodos

### `ngOnInit()`
Lanza en paralelo `cargar()`, `cargarSelects()` y `verificarCaja()`.
Luego suscribe a `onTurnoActualizado$` para auto-refrescar cuando el WebSocket avisa un cambio.

---

### `verificarCaja()` *(privado)*
Llama a `cajaService.obtenerEstado()`.
Setea `cajaAbierta = true` si `cajaHoy?.estado === 'abierta'`.
Si falla, `cajaAbierta = false`. Esto habilita o deshabilita el botón "Cobrar" en la tabla.

---

### `ngOnDestroy()`
Desuscribe `sub` para evitar memory leaks.

---

### `cargar()` — cargar turnos y facturas
Llama en paralelo:
- `turnoSvc.listar(estado, { fechaDesde, fechaHasta })` con los filtros actuales → `turnos`
- `facturaSvc.listar()` (sin filtro de fecha, solo importa el `turnoId`) → construye `turnosConFactura`

Llama a `cdr.detectChanges()` al terminar.
**Llamado por:** `ngOnInit`, el WebSocket, los botones de filtro.

---

### `limpiarFiltros()` — resetear todos los filtros
Vuelve las fechas a hoy, limpia estado, búsqueda y trabajador, y llama a `cargar()`.
**Llamado por:** botón "Limpiar filtros".

---

### `cargarSelects()` — datos para los selects del formulario
Carga en paralelo: clientes, servicios activos (`listar(true)`), y usuarios.
Filtra `trabajadores`: solo activos, disponibles, y con rol `trabajador`.
Rellena `clientesMap` para uso posterior en WhatsApp.

---

### `onClienteChange()` — cuando se cambia el cliente en el formulario
Resetea `vehiculoId` y `vehiculosCliente`.
Llama a `vehiculoSvc.listarPorCliente(clienteId)`.
Rellena `vehiculosMap`.
**Llamado por:** evento `(change)` del select de clientes.

---

### `abrirForm()` — abrir modal de nuevo turno
Resetea el formulario y limpia errores.

---

### `cerrarForm()` — cerrar modal sin guardar

---

### `guardar()` — crear nuevo turno
Construye el payload convirtiendo `fechaHora` a ISO string.
Llama a `turnoSvc.crear(payload)`.
Si tiene éxito: cierra el modal, recarga, y muestra toast de WhatsApp usando los datos del `clientesMap` y `vehiculosMap`.
Si falla: muestra `errorForm`.

---

### `finalizarOrden(turno)` — marcar como completado (sin cobrar)
Llama a `turnoSvc.cambiarEstado(turno.id, 'completado')` y recarga.
Si el turno tiene teléfono de cliente: muestra toast de WhatsApp para avisar que el auto está listo.
**Llamado por:** botón "Finalizar" en los turnos `en_proceso`.

---

### `iniciarCobrar(turno)` — abrir modal de cobro
Rellena `ordenACompletar`, `totalFactura` (precio del servicio), resetea errores.
**Llamado por:** botón "Cobrar" en los turnos `completado` que no tienen factura todavía.

---

### `cerrarModalCompletar()` — cerrar el modal de cobro

---

### `confirmarCobro()` — generar la factura y cobrar
Llama a `facturaSvc.crear({ turnoId, total, metodoPago })`.
Si tiene éxito: enriquece la factura con los datos del turno (`facturaGenerada = { ...factura, turno: ordenACompletar }`), cierra el modal y recarga.
Si falla: extrae el mensaje de error de la respuesta de la API.
Usa `guardandoCompletar` para prevenir doble click.
**Llamado por:** botón "Confirmar cobro" del modal.

---

### `cerrarFacturaGenerada()` / `imprimirFactura()`
Cierra la vista previa o llama a `window.print()`.

---

### `cambiarEstado(turno, estado)` — cambiar estado manualmente
Llama a `turnoSvc.cambiarEstado(turno.id, estado)` y recarga.
**Llamado por:** botones de transición de estado en la tabla (ej: "Cancelar").

---

### `transiciones(t)` — qué estados puede tomar este turno
Devuelve `TRANSICIONES[t.estado]`.
**Llamado por:** el template para renderizar los botones de acción disponibles.
