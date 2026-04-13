# Historial de Caja — `historial-caja.component.ts`

**Ruta:** `/historial-caja`
**Archivo:** `frontangular/src/app/pages/historial-caja/historial-caja.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]] | [[caja]]
**Módulo backend que usa:** [[../backend/caja]]

Muestra las cajas de días anteriores (cerradas) en un accordion. Al expandir un día, carga su resumen detallado bajo demanda.

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `cajaService` | `CajaService` | Obtener el historial y el resumen de cada caja |
| `cdr` | `ChangeDetectorRef` | Forzar actualización de la vista después de operaciones async |

---

## Tipo `DiaHistorial` (definido en el mismo archivo)

Estructura interna que wrappea cada `CajaDia` con estado de UI:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cajaDia` | `CajaDia` | Los datos de la caja del día |
| `resumen` | `ResumenCaja \| null` | El resumen (null hasta que se expande) |
| `cargando` | `boolean` | Si se está cargando el resumen de ese día |
| `abierto` | `boolean` | Si el accordion está expandido |

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `dias` | `DiaHistorial[]` | Array de todos los días del historial |
| `cargando` | `boolean` | Carga inicial de la lista |
| `error` | `string` | Error general de la página |
| `facturaDetalle` | `Factura \| null` | Factura abierta en el modal de detalle |

---

## Métodos

### `ngOnInit()`
1. Llama a `cajaService.historial()` para obtener las últimas 30 cajas cerradas
2. Mapea los resultados a `DiaHistorial[]`, marcando los primeros 2 como `abierto: true`
3. Carga en paralelo el resumen de esos primeros 2 días con `cargarResumen()`
4. Llama a `cdr.detectChanges()` al terminar

---

### `toggle(dia)` — expandir o colapsar un día
Invierte `dia.abierto`.
Si se acaba de abrir y no tiene resumen todavía: llama a `cargarResumen(dia)`.
**Llamado por:** click en el header de cada ítem del accordion.

---

### `cargarResumen(dia)` *(privado)* — cargar resumen de un día específico
Verifica que no esté ya cargando o que ya tenga resumen (evita fetch duplicado).
Llama a `cajaService.obtenerResumen(dia.cajaDia.id)`.
Si tiene éxito: guarda el resultado en `dia.resumen`.
Si falla: silencioso (el usuario puede reintentar haciendo toggle).
Llama a `cdr.detectChanges()` al terminar.

---

### `efectivoEnCaja(r)` — calcular efectivo físico en una caja cerrada
Fórmula: `montoInicial + ventasEfectivo + ingresosManualEfectivo - gastosEfectivo`
Mismo cálculo que en `caja.component.ts`.
**Llamado por:** el template para cada día expandido.

---

### `formatFecha(fecha)` — formatear fecha del día
Convierte `YYYY-MM-DD` a texto completo con día de la semana en español usando UTC-5.
Ejemplo: `"2026-04-13"` → `"lunes, 13 de abril de 2026"`.

---

### `verFactura(f)` / `cerrarFactura()`
Abre o cierra el modal de detalle de una factura específica.
**Llamado por:** filas de la tabla de facturas dentro de cada día expandido.
