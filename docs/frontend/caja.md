# Caja — `caja.component.ts`

**Ruta:** `/caja`
**Archivo:** `frontangular/src/app/pages/caja/caja.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]] | [[historial-caja]]
**Módulo backend que usa:** [[../backend/caja]]

Pantalla exclusiva del admin para controlar la caja diaria.
Dependiendo del estado actual, muestra una vista diferente.

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `cajaService` | `CajaService` | Todas las operaciones de caja (abrir, cerrar, gastos, ingresos, resumen) |
| `cdr` | `ChangeDetectorRef` | Forzar la actualización de la vista cuando los datos cambian asincrónicamente |

---

## Tipo `Vista` (definido en el mismo archivo)

Define en qué "pantalla" está el componente:

| Valor | Cuándo se muestra |
|-------|-------------------|
| `'cargando'` | Mientras se consulta el estado inicial |
| `'cerrar_anterior'` | Hay una caja de un día anterior sin cerrar |
| `'abrir'` | No hay caja de hoy todavía |
| `'abierta'` | La caja de hoy está abierta |
| `'cerrada_hoy'` | La caja de hoy ya fue cerrada |

---

## Propiedades de la clase

### Estado general
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `vista` | `Vista` | La "pantalla" que se muestra actualmente |
| `error` | `string` | Mensaje de error general de la página |
| `guardando` | `boolean` | Deshabilita botones mientras se procesa una acción |
| `resumenVersion` | `number` (privado) | Contador para evitar que respuestas lentas sobreescriban datos frescos |

### Datos de caja
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `cajaHoy` | `CajaDia \| null` | La caja del día actual |
| `cajaSinCerrar` | `CajaDia \| null` | Caja de día anterior que quedó abierta |
| `resumen` | `ResumenCaja \| null` | Resumen completo de la caja de hoy (carga en segundo plano) |
| `resumenAnterior` | `ResumenCaja \| null` | Resumen de la caja sin cerrar (para mostrar antes de cerrarla) |

### Apertura
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `montoInicial` | `number` | Monto ingresado en el formulario de apertura |
| `observacionesApertura` | `string` | Observaciones opcionales al abrir |

### Modal de gasto
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `modalGasto` | `boolean` | Muestra/oculta el modal |
| `gastoConcepto` | `string` | Campo texto del concepto |
| `gastoMonto` | `number \| null` | Monto del gasto |
| `gastoTipo` | `TipoPagoCaja` | `efectivo` o `transferencia` |

### Modal de ingreso manual
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `modalIngreso` | `boolean` | Muestra/oculta el modal |
| `ingresoConcepto` | `string` | Campo texto del concepto |
| `ingresoMonto` | `number \| null` | Monto del ingreso |
| `ingresoTipo` | `TipoPagoCaja` | `efectivo` o `transferencia` |

### Modal de cierre
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `modalCierre` | `boolean` | Muestra el resumen final antes de confirmar el cierre |

### Modal de factura
| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `facturaDetalle` | `Factura \| null` | Factura seleccionada para ver detalle/imprimir |

---

## Métodos

### `ngOnInit()` — arranque
Llama a `verificarEstado()`.

---

### `verificarEstado()` — determina qué vista mostrar
1. Setea `vista = 'cargando'` y limpia el error
2. Llama a `cajaService.obtenerEstado()` que devuelve `{ cajaHoy, cajaSinCerrar }`
3. Según el resultado:
   - Si hay `cajaSinCerrar`: carga su resumen con `cajaService.obtenerResumen()` → `resumenAnterior`, muestra `vista = 'cerrar_anterior'`
   - Si no hay `cajaHoy`: `vista = 'abrir'`
   - Si `cajaHoy.estado === 'abierta'`: `vista = 'abierta'` y lanza `cargarResumenHoy()` en background
   - Si no: `vista = 'cerrada_hoy'` y lanza `cargarResumenHoy()` en background
4. Llama a `cdr.detectChanges()` para que Angular actualice la vista

**Llamado por:** `ngOnInit`, después de cerrar la caja anterior, después de abrir, después de confirmar el cierre.

---

### `cargarResumenHoy()` *(privado)* — carga el resumen en segundo plano
Incrementa `resumenVersion` antes de hacer el fetch.
Llama a `cajaService.obtenerResumen(cajaHoy.id)`.
Solo actualiza `this.resumen` si la versión sigue siendo la misma (evita que una respuesta lenta sobreescriba datos más nuevos).
Llama a `cdr.detectChanges()`.

**Llamado por:** `verificarEstado()` y `abrirModalCierre()`.

---

### `cerrarAnterior()` — cerrar la caja del día anterior
Llama a `cajaService.cerrar(cajaSinCerrar.id)` y luego a `verificarEstado()` para redibujar.
**Llamado por:** botón "Cerrar caja anterior" en la vista `cerrar_anterior`.

---

### `abrirCaja()` — abrir la caja del día
Llama a `cajaService.abrir(montoInicial, observaciones)`.
Si tiene éxito: guarda `cajaHoy`, resetea el formulario, llama a `cargarResumenHoy()`, setea `vista = 'abierta'`.
Si falla: muestra el mensaje de error en `this.error`.
**Llamado por:** botón "Abrir caja" en la vista `abrir`.

---

### `abrirModalCierre()` — abrir el modal de cierre con el resumen actualizado
Llama a `cargarResumenHoy()` para tener los datos frescos, luego muestra el modal.
**Llamado por:** botón "Cerrar caja" en la vista `abierta`.

---

### `confirmarCierre()` — cerrar la caja de hoy
Llama a `cajaService.cerrar(cajaHoy.id)`.
Cierra el modal y llama a `verificarEstado()` para redibujar.
**Llamado por:** botón "Confirmar cierre" dentro del modal de cierre.

---

### `guardarGasto()` — registrar un gasto
1. Guarda los valores del formulario en variables locales y resetea el formulario (UX optimista)
2. Cierra el modal
3. Llama a `cajaService.registrarGasto(concepto, monto, tipo)`
4. Si tiene éxito: actualiza el resumen **localmente** sin hacer un nuevo fetch:
   - Agrega el gasto a `resumen.gastos.lista`
   - Suma al tipo de gasto correcto (`efectivo` o `transferencia`)
   - Suma a `gastos.total`
   - Resta de `ganancias.lavadero`
5. Si falla: muestra error

**Llamado por:** botón "Guardar" en el modal de gasto.

---

### `eliminarGasto(gasto)` — eliminar un gasto
1. Pide confirmación con `confirm()`
2. Actualiza el resumen **localmente al instante** (sin esperar la API):
   - Quita el gasto de `resumen.gastos.lista`
   - Resta de `efectivo` o `transferencia` y de `total`
   - Suma de vuelta a `ganancias.lavadero`
3. Llama a `cajaService.eliminarGasto(gasto.id)`
4. Si la API falla: muestra error y llama a `cargarResumenHoy()` para revertir

**Llamado por:** botón "Eliminar" en la lista de gastos.

---

### `guardarIngreso()` — registrar un ingreso manual
Mismo patrón optimista que `guardarGasto()` pero para ingresos:
- Agrega a `resumen.ingresosManualLista`
- Suma a `ingresos.ingresosManual` e `ingresos.total`
- Suma a `ganancias.totalDia` y `ganancias.lavadero`

**Llamado por:** botón "Guardar" en el modal de ingreso manual.

---

### `eliminarIngreso(ing)` — eliminar un ingreso manual
Mismo patrón optimista que `eliminarGasto()` pero en sentido inverso para ingresos.

**Llamado por:** botón "Eliminar" en la lista de ingresos manuales.

---

### `efectivoEnCaja(r)` — calcular cuánto efectivo físico hay en la caja
Fórmula: `montoInicial + ventasEfectivo + ingresosManualEfectivo - gastosEfectivo`
Devuelve el total de billetes que debería haber en la caja física.
**Llamado por:** el template para mostrar el total de efectivo.

---

### `formatFecha(fecha)` — formatear fecha para mostrar
Convierte un string `YYYY-MM-DD` a un texto legible con día de la semana en español, usando UTC-5.
Ejemplo: `"2026-04-13"` → `"lunes, 13 de abril de 2026"`.
**Llamado por:** el template.

---

### `verFactura(f)` / `cerrarFactura()` — modal de detalle de factura
Abre o cierra el modal con el detalle de una factura específica.
**Llamado por:** filas de la tabla de facturas en el resumen.
