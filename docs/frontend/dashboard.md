# Dashboard — `dashboard.component.ts`

**Ruta:** `/dashboard`
**Archivo:** `frontangular/src/app/pages/dashboard/dashboard.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]]
**Módulos backend que usa:** [[../backend/turnos]] · [[../backend/facturacion]] · [[../backend/caja]] · [[../backend/usuarios]]

Es la pantalla principal. Muestra una vista distinta según el rol del usuario.
- **Admin:** ve todos los turnos del día agrupados, puede crear órdenes, cobrar, y controlar la caja.
- **Trabajador:** ve solo sus propios turnos y su ganancia estimada del día.

---

## Servicios inyectados (`inject()`)

| Propiedad | Servicio | Para qué lo usa |
|-----------|----------|-----------------|
| `sesion` | `SesionService` | Obtiene el usuario logueado del token JWT |
| `turnoSvc` | `TurnoService` | Lista y cambia estado de turnos |
| `authSvc` | `AuthService` | Toggle disponibilidad y historial de login |
| `usuarioSvc` | `UsuarioService` | Lista trabajadores para mostrar en el panel |
| `clienteSvc` | `ClienteService` | Lista clientes para el formulario de nueva orden |
| `vehiculoSvc` | `VehiculoService` | Lista vehículos cuando el admin elige un cliente |
| `servicioSvc` | `ServicioService` | Lista servicios para el formulario de nueva orden |
| `cajaService` | `CajaService` | Obtiene el estado de la caja, abre y cierra |
| `facturaSvc` | `FacturacionService` | Lista facturas del día y crea nuevas al cobrar |
| `realtime` | `RealtimeService` | Escucha eventos de WebSocket para auto-actualizar |

---

## Constantes del módulo (fuera de la clase)

| Nombre | Qué es |
|--------|--------|
| `METODO_LABEL` | Diccionario `MetodoPago → string legible` (ej: `efectivo → "Efectivo"`) |
| `METODOS` | Array con los 4 métodos de pago disponibles |
| `fmt` | Formateador de fechas en zona horaria Bogotá (UTC-5) |
| `esHoy(fechaIso)` | Función libre: devuelve `true` si la fecha ISO cae en el día actual en Colombia |
| `horaStr(fechaIso)` | Función libre: convierte una fecha ISO a string de hora (ej: `"09:30"`) |

---

## Propiedades de la clase

### Estado general
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `esAdmin` | `boolean` | Si el usuario logueado es admin. Se setea en `ngOnInit` |
| `usuario` | `Usuario \| null` | Datos del usuario actual (del `SesionService`) |
| `cargando` | `boolean` | Controla el indicador de carga |

### Solo Admin — turnos del día
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `enProceso` | `Turno[]` | Turnos con estado `en_proceso` |
| `pendientes` | `Turno[]` | Turnos con estado `pendiente` |
| `completadosHoy` | `Turno[]` | Turnos `completado` cuya `fechaHora` sea hoy |
| `turnosFacturadosSet` | `Set<string>` | IDs de turnos que ya tienen factura (para ocultar botón "Cobrar") |
| `facturasHoy` | `Factura[]` | Facturas de los turnos completados hoy |
| `trabajadores` | `Usuario[]` | Empleados activos con rol `trabajador` |
| `ingresos` | `number` | Suma de `total` de `facturasHoy` |
| `ultimoUpdate` | `string` | Hora de la última actualización (ej: `"10:45"`) |

### Solo Trabajador
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `misPendientes` | `Turno[]` | Sus turnos pendientes |
| `misEnProceso` | `Turno[]` | Sus turnos en proceso |
| `misCompletadosHoy` | `Turno[]` | Sus turnos completados hoy |
| `gananciaHoy` | `number` | Suma de precios × su comisión de los completados hoy |

### Caja
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `cajaHoy` | `CajaDia \| null` | La caja del día actual |
| `cajaSinCerrar` | `CajaDia \| null` | Caja de día anterior que quedó abierta |
| `modalAbrirCaja` | `boolean` | Controla visibilidad del modal de apertura |
| `montoInicialCaja` | `number` | Valor ingresado en el input del modal de apertura |
| `guardandoCaja` | `boolean` | Deshabilita el botón mientras se procesa |

### Modal cobro
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `mostrarModalCobro` | `boolean` | Muestra/oculta el modal de cobro |
| `ordenACobrar` | `Turno \| null` | El turno que se está cobrando |
| `metodoPago` | `MetodoPago` | Método seleccionado en el modal (default: `efectivo`) |
| `totalFactura` | `number` | Monto editable. Pre-carga con el precio del servicio |
| `errorCobro` | `string` | Error a mostrar si falla el cobro |
| `guardandoCobro` | `boolean` | Previene doble-click |
| `facturaGenerada` | `Factura \| null` | Factura recién creada, para mostrar vista previa |

### Modal nueva orden
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `mostrarFormOrden` | `boolean` | Muestra/oculta el modal de nueva orden |
| `errorFormOrden` | `string` | Error a mostrar si falla al guardar |
| `guardandoFormOrden` | `boolean` | Previene doble-click |
| `clientesOrden` | `Cliente[]` | Lista de clientes para el select |
| `vehiculosOrden` | `Vehiculo[]` | Vehículos del cliente seleccionado |
| `serviciosOrden` | `Servicio[]` | Servicios activos para el select |
| `formOrden` | `object` | Campos del formulario: `clienteId, vehiculoId, servicioId, trabajadorId, fechaHora, observaciones` |
| `clientesMap` | `Map<string,Cliente>` | Mapa para lookup rápido de cliente por ID (para WhatsApp) |
| `vehiculosMap` | `Map<string,Vehiculo>` | Mapa para lookup rápido de vehículo por ID |

### Suscripciones (privadas)
| Propiedad | Descripción |
|-----------|-------------|
| `intervalo` | `setInterval` que llama a `cargar()` cada 60 segundos |
| `sub` | Suscripción al evento `onTurnoActualizado$` del WebSocket |
| `subUsuario` | Suscripción al evento `onUsuarioActualizado$` del WebSocket |

---

## Getter

### `hoy`
Devuelve la fecha actual como string legible en español (ej: `"lunes, 13 de abril de 2026"`).
Usado en el header del dashboard.

---

## Métodos

### `ngOnInit()` — arranque del componente
1. Lee el usuario logueado desde `SesionService`
2. Determina si es admin (`esAdmin`)
3. Lanza en paralelo: `cargar()`, y si es admin también `cargarEstadoCaja()` y `cargarSelectsOrden()`
4. Arranca un `setInterval` que llama a `cargar()` cada 60 segundos
5. Se suscribe a `onTurnoActualizado$`: cuando el WebSocket avisa un cambio, llama a `cargar()`
6. Se suscribe a `onUsuarioActualizado$`: si el evento es del propio usuario, actualiza `disponible` en memoria, y llama a `cargar()`

**Llamado por:** Angular al montar el componente.

---

### `ngOnDestroy()` — limpieza
Cancela el `setInterval` y desuscribe los dos Observables.
**Importante:** si no se hace esto, los intervalos y suscripciones quedan corriendo en memoria.

---

### `cargar()` — recarga los datos
Delega a `cargarAdmin()` o `cargarTrabajador()` según el rol.

**Llamado por:** `ngOnInit`, el intervalo, los eventos de WebSocket, y después de cada acción (cobro, nueva orden, etc.).

---

### `cargarAdmin()` *(privado)* — datos del panel admin
Ejecuta en paralelo:
- `turnoSvc.listar('en_proceso')` → `enProceso`
- `turnoSvc.listar('pendiente')` → `pendientes`
- `turnoSvc.listar('completado')` → turnos completados (solo si la caja no está cerrada)
- `facturaSvc.listar()` → todas las facturas (solo si la caja no está cerrada)
- `usuarioSvc.listar()` → `trabajadores`

Luego calcula:
- `completadosHoy`: filtra los completados que sean de hoy con `esHoy()`
- `turnosFacturadosSet`: Set de turnoIds que ya tienen factura
- `facturasHoy`: facturas cuyos `turnoId` estén en `completadosHoy`
- `ingresos`: suma de `facturasHoy`

> Si la caja está cerrada, no carga completados ni facturas (optimización).

---

### `cargarTrabajador()` *(privado)* — datos del panel trabajador
Llama a `turnoSvc.listarPorTrabajador(usuarioId)`.
Separa los resultados en `misPendientes`, `misEnProceso`, `misCompletadosHoy`.
Calcula `gananciaHoy`: suma `precio * comision/100` de cada turno completado hoy.

---

### `iniciarTurno(id)` — cambiar estado a `en_proceso`
Llama a `turnoSvc.cambiarEstado(id, 'en_proceso')` y recarga.
**Llamado por:** botón "Iniciar" en la vista trabajador.

---

### `finalizarTurno(turno)` — cambiar estado a `completado`
Llama a `turnoSvc.cambiarEstado(turno.id, 'completado')` y recarga.
Luego muestra un toast con link de WhatsApp para avisar al cliente que su auto está listo.
**Llamado por:** botón "Finalizar" en la vista trabajador.

---

### `iniciarCobro(turno)` — abrir modal de cobro
Pre-carga `ordenACobrar`, `totalFactura` (precio del servicio), y resetea errores.
Muestra el modal (`mostrarModalCobro = true`).
**Llamado por:** botón "Cobrar" en la tabla de turnos completados del admin.

---

### `cerrarModalCobro()` — cerrar modal de cobro sin guardar
Oculta el modal y limpia `ordenACobrar`.

---

### `confirmarCobro()` — guardar el cobro
Llama a `facturaSvc.crear({ turnoId, total, metodoPago })`.
- Si tiene éxito: guarda la factura en `facturaGenerada` (para mostrar vista previa), cierra el modal y recarga.
- Si falla: extrae el mensaje de error del objeto de error de la API y lo muestra en `errorCobro`.
Usa `guardandoCobro` para prevenir doble-click.
**Llamado por:** botón "Confirmar cobro" en el modal.

---

### `cerrarFacturaGenerada()` — cerrar vista previa de factura
Setea `facturaGenerada = null`.

---

### `imprimirFactura()` — imprimir
Llama a `window.print()`. El CSS tiene reglas `@media print` para ocultar el resto y mostrar solo la factura.

---

### `totalFacturadoPorTurno(turnoId)` — helper del template
Busca en `facturasHoy` la factura del turno dado y devuelve su total.
Devuelve `0` si no tiene factura.
**Llamado por:** el HTML para mostrar el monto cobrado en la tabla de completados.

---

### `toggleDisponibilidad()` — cambiar disponibilidad (vista trabajador)
Llama a `authSvc.toggleDisponibilidad(!disponible)`.
Luego re-lee el usuario desde `SesionService` para actualizar la UI.
**Llamado por:** botón toggle en la vista trabajador.

---

### `cargarSelectsOrden()` *(privado)* — datos del formulario de nueva orden
Carga en paralelo los clientes y servicios activos.
Rellena `clientesMap` para lookup por ID.
**Llamado por:** `ngOnInit` (solo si es admin).

---

### `ahoraLocal()` *(privado)* — fecha/hora actual formateada
Devuelve string `YYYY-MM-DDTHH:MM` (el formato que acepta `<input type="datetime-local">`).
**Llamado por:** `abrirFormOrden()` para pre-cargar la fecha.

---

### `abrirFormOrden()` — abrir modal de nueva orden
Resetea `formOrden` con valores vacíos y la hora actual.
Limpia `vehiculosOrden` y errores.
**Llamado por:** botón "Nueva orden" del panel.

---

### `cerrarFormOrden()` — cerrar modal de nueva orden sin guardar

---

### `onClienteOrdenChange()` — cuando el admin cambia el cliente en el formulario
Resetea el campo `vehiculoId`.
Llama a `vehiculoSvc.listarPorCliente(clienteId)` para cargar los autos del cliente elegido.
Rellena `vehiculosMap` con los resultados.
**Llamado por:** evento `(change)` del select de clientes en el formulario.

---

### `guardarOrden()` — crear nuevo turno
Llama a `turnoSvc.crear(payload)`.
- Si tiene éxito: cierra el modal, recarga, y muestra toast de WhatsApp para avisar al cliente.
- Si falla: extrae el mensaje de error de la API.
**Llamado por:** botón "Guardar" del modal de nueva orden.

---

### `cargarEstadoCaja()` — obtener estado de la caja
Llama a `cajaService.obtenerEstado()` y guarda en `cajaHoy` y `cajaSinCerrar`.
No lanza error si falla (silencioso).
**Llamado por:** `ngOnInit` (si es admin).

---

### `abrirCaja()` — abrir la caja del día
Llama a `cajaService.abrir(montoInicialCaja)`.
Si tiene éxito: actualiza `cajaHoy`, cierra el modal y resetea el monto.
**Llamado por:** botón "Abrir caja" del modal.

---

### `cerrarCaja()` — cerrar la caja de hoy
Pide confirmación con `confirm()`.
Llama a `cajaService.cerrar(cajaHoy.id)`.
**Llamado por:** botón "Cerrar caja" del panel.

---

### `cerrarCajaAnterior()` — cerrar una caja de día anterior
Pide confirmación.
Llama a `cajaService.cerrar(cajaSinCerrar.id)` y limpia `cajaSinCerrar`.
**Llamado por:** alerta que aparece cuando hay una caja anterior sin cerrar.
