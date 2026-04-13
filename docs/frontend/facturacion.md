# Facturación — `facturacion.component.ts`

**Ruta:** `/facturacion`
**Archivo:** `frontangular/src/app/pages/facturacion/facturacion.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]]
**Módulo backend que usa:** [[../backend/facturacion]]

Historial de todas las facturas generadas. Permite filtrar por fecha, ver estadísticas e imprimir facturas individuales.

---

## Servicio inyectado

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `svc` | `FacturacionService` | Listar facturas por rango de fechas |

## Utilidades importadas
- `formatFecha` — formatea fecha de emisión para la tabla
- `formatPrecio` — formatea montos en pesos colombianos
- `fechaLocal` — fecha de hoy en formato `YYYY-MM-DD` (timezone Colombia)
- `primerDiaMesLocal` — primer día del mes actual

## Constante del módulo
- `METODO_LABEL` — diccionario `MetodoPago → string legible`

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `facturas` | `Factura[]` | Lista cargada desde la API |
| `cargando` | `boolean` | Indicador de carga |
| `filtroDesde` | `string` | Fecha inicio del rango (default: primer día del mes) |
| `filtroHasta` | `string` | Fecha fin del rango (default: hoy) |
| `facturaSeleccionada` | `Factura \| null` | La factura abierta en el modal de impresión |

---

## Getters (calculados sobre `facturas`)

### `totalIngresos`
Suma de `total` de todas las facturas del período.

### `totalPorMetodo`
Devuelve un objeto `Record<MetodoPago, number>` con la suma separada por método de pago.
Recorre todas las facturas y agrupa por `metodoPago`.

### `promedioPorOrden`
`totalIngresos / facturas.length`. Devuelve `0` si no hay facturas.

---

## Métodos

### `ngOnInit()`
Llama a `cargar()`.

---

### `cargar()` — cargar facturas del período
Llama a `svc.listar(filtroDesde, filtroHasta)`.
**Llamado por:** `ngOnInit` y el evento `(change)` de cada input de fecha.

---

### `verFactura(f)` — abrir modal de impresión
Asigna `facturaSeleccionada = f`. El modal aparece en el template con `@if (facturaSeleccionada)`.
**Llamado por:** botón "Imprimir" en cada fila de la tabla.

---

### `cerrarFactura()` — cerrar modal
Asigna `facturaSeleccionada = null`.

---

### `imprimir()` — lanzar impresión del navegador
Llama a `window.print()`. El CSS tiene clases `.no-print` y `.factura-print` que controlan qué se muestra al imprimir.
**Llamado por:** botón "Imprimir" dentro del modal.
