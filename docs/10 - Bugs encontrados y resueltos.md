# 🐛 Bugs encontrados y resueltos

> Última actualización: abril 2026 — Revisión realizada con análisis estático + revisión manual de código + bugs detectados durante desarrollo de flujo de órdenes

---

## Metodología

Se hizo una revisión completa del backend (NestJS) y el frontend (Angular) buscando:
- Fugas de datos entre tenants (multi-tenancy)
- Lógica incorrecta en servicios
- Inconsistencias en queries de base de datos
- Bugs de zona horaria
- Problemas de tipado y manejo de errores

La compilación TypeScript (`tsc --noEmit`) no arrojó errores en ninguno de los dos proyectos. Los bugs son de lógica de negocio y seguridad, no de tipos.

---

## ✅ Bugs arreglados

---

### Bug 1 — Fuga de datos: `historialLogin` sin filtro de tenant

**Severidad:** Alta
**Archivos:** `backend/src/modules/auth/auth.service.ts` · `backend/src/modules/auth/auth.controller.ts`

**Problema:**
El endpoint `GET /api/auth/historial` devolvía los logs de login de **todos los tenants** sin filtrar. Cualquier admin podía ver cuándo y desde qué cuenta iniciaron sesión los empleados de otros lavaderos.

**Causa:**
El servicio `historialLogin()` no recibía `tenantId` y hacía un `find()` sin cláusula `where`.

**Fix:**
Se agregó `tenantId` como parámetro al servicio y se filtra en la query:
```ts
// Antes
return this.loginLogRepo.find({ order: { fechaHora: 'DESC' }, take: limit });

// Después
return this.loginLogRepo.find({ where: { tenantId }, order: { fechaHora: 'DESC' }, take: limit });
```

---

### Bug 2 — Inconsistencia: `eliminarGasto` busca la caja sin `tenantId`

**Severidad:** Media
**Archivo:** `backend/src/modules/caja/caja.service.ts`

**Problema:**
Al eliminar un gasto, el servicio validaba correctamente que el gasto pertenezca al tenant, pero la consulta posterior para verificar si la caja está cerrada se hacía sin filtrar por `tenantId`.

**Causa:**
`cajaDiaRepo.findOne({ where: { id: gasto.cajaDiaId } })` — falta `tenantId` en el `where`.

**Fix:**
```ts
// Antes
const caja = await this.cajaDiaRepo.findOne({ where: { id: gasto.cajaDiaId } });

// Después
const caja = await this.cajaDiaRepo.findOne({ where: { id: gasto.cajaDiaId, tenantId } });
```

---

### Bug 3 — Inconsistencia: `eliminarIngresoManual` busca la caja sin `tenantId`

**Severidad:** Media
**Archivo:** `backend/src/modules/caja/caja.service.ts`

**Problema:**
Igual que el Bug 2, pero en el método `eliminarIngresoManual`. La validación del ingreso usa `tenantId`, pero la búsqueda de la caja para verificar si está cerrada no lo usa.

**Fix:**
```ts
// Antes
const caja = await this.cajaDiaRepo.findOne({ where: { id: ing.cajaDiaId } });

// Después
const caja = await this.cajaDiaRepo.findOne({ where: { id: ing.cajaDiaId, tenantId } });
```

---

### Bug 4 — Zona horaria hardcodeada en `calcularResumen`

**Severidad:** Alta (rompe para tenants fuera de Colombia)
**Archivo:** `backend/src/modules/caja/caja.service.ts`

**Problema:**
La query que busca facturas del día usaba el offset `-05:00` (Colombia) fijo, ignorando la zona horaria configurada por cada tenant. Esto era invisible mientras el sistema tenía un solo lavadero, pero con multi-tenancy rompe para cualquier tenant en otra zona horaria.

**Causa:**
```ts
desde: new Date(`${fecha}T00:00:00-05:00`),  // hardcodeado
hasta: new Date(`${fecha}T23:59:59-05:00`),
```

**Fix:**
Se agregó el helper privado `offsetDesdeZonaHoraria()` que deriva el offset ISO desde la `zonaHoraria` del tenant (ej: `America/Bogota` → `-05:00`), y se usa en la query:
```ts
const offset = this.offsetDesdeZonaHoraria(await this.zonaHorariaTenant(tenantId));
desde: new Date(`${fecha}T00:00:00${offset}`),
hasta: new Date(`${fecha}T23:59:59${offset}`),
```

---

### Bug 5 — Zona horaria hardcodeada en `listarFacturasDia`

**Severidad:** Alta (rompe para tenants fuera de Colombia)
**Archivo:** `backend/src/modules/caja/caja.service.ts`

**Problema:**
El mismo problema que el Bug 4, en el método `listarFacturasDia`. Usaba `-05:00` hardcodeado para calcular el rango de fechas de facturas de un día de caja.

**Fix:**
Mismo enfoque que Bug 4: usar `offsetDesdeZonaHoraria()` con la zona del tenant.

---

## 🔍 Revisados y descartados (no son bugs)

---

### Revisión 6 — `cambiarPassword` sin `tenantId`

**Veredicto:** No es un bug.

`buscarPorIdConPassword()` y `actualizarPasswordHash()` no reciben `tenantId`, pero el `usuarioId` que reciben proviene directamente del token JWT del usuario autenticado. Un usuario solo puede cambiar su propia contraseña — no hay forma de pasar un ID externo.

---

### Revisión 7 — `actualizarDisponibilidad` sin `tenantId`

**Veredicto:** No es un bug.

Igual que el caso anterior: el `usuarioId` viene del token JWT. El endpoint `PATCH /auth/disponibilidad` solo afecta al usuario que hace la petición.

---

### Revisión 8 — JWT strategy no valida `tenantId` del token vs. BD

**Veredicto:** No es un bug hoy, pero es una deuda técnica.

El `JwtStrategy.validate()` busca al usuario solo por `id`, sin verificar que el `tenantId` del token coincida con el de la BD. Hoy no hay riesgo porque el email es globalmente único y no hay usuarios compartidos entre tenants. Si en el futuro se permite el mismo email en múltiples tenants, esto necesitaría revisión.

---

### Revisión 9 — `calcularResumen`: gastos e ingresos sin `tenantId`

**Veredicto:** No es un bug.

`gastoCajaRepo.find({ where: { cajaDiaId } })` y `ingresoManualRepo.find({ where: { cajaDiaId } })` no filtran por `tenantId`, pero el `cajaDiaId` fue validado en la línea anterior con `findOne({ where: { id: cajaDiaId, tenantId } })`. Si esa validación pasa, la caja pertenece al tenant y por lo tanto también sus gastos e ingresos.

---

### Revisión 10 — Turnos: sin validación local de transición de estado en el frontend

**Veredicto:** No es un bug crítico, es una mejora de UX.

El componente `turnos.component.ts` no valida localmente si una transición de estado es válida antes de llamar al backend. El backend sí rechaza transiciones inválidas. El usuario solo verá un error del servidor, no una validación anticipada. Queda como mejora futura.

---

---

### Bug 6 — Rutas de vehículos: `GET :id` capturaba `cliente/:id` y `placa/:placa`

**Severidad:** Alta (rompía la carga de vehículos al seleccionar cliente en nueva orden)
**Archivo:** `backend/src/modules/vehiculos/vehiculos.controller.ts`

**Problema:**
El decorador `@Get(':id')` estaba declarado **antes** que `@Get('cliente/:clienteId')` y `@Get('placa/:placa')`. NestJS evalúa las rutas en orden de declaración, por lo que `cliente/xxx` y `placa/xxx` eran capturadas por `:id` y nunca llegaban al handler correcto. El select de vehículos en "Nueva orden" siempre mostraba vacío.

**Fix:**
Mover las rutas específicas (`cliente/:clienteId` y `placa/:placa`) **antes** de la ruta comodín `GET :id`.

---

### Bug 7 — Vehículo no se guardaba al crear cliente (creación silenciosa fallida)

**Severidad:** Alta
**Archivos:** `backend/src/modules/clientes/clientes.service.ts` · `backend/src/modules/clientes/clientes.module.ts`

**Problema:**
Al crear un cliente con vehículo incluido, el vehículo no se guardaba. El error era silencioso porque `DataSource.transaction()` no tenía acceso al repositorio de `Vehiculo` — la entidad no estaba registrada en `TypeOrmModule.forFeature()` del módulo `ClientesModule`.

**Fix:**
1. Agregar `Vehiculo` a `TypeOrmModule.forFeature([Cliente, Vehiculo])` en `clientes.module.ts`
2. Inyectar `@InjectRepository(Vehiculo)` directamente en `ClientesService`
3. Simplificar el flujo: el frontend hace **dos llamadas separadas** — primero crea el cliente, luego crea el vehículo con el `clienteId` recibido. Más simple y sin dependencia de transacciones cross-repositorio.

---

### Bug 8 — `montoInicial` de caja contaba como ingreso del día

**Severidad:** Media (afectaba el resumen financiero)
**Archivo:** `backend/src/modules/caja/caja.service.ts`

**Problema:**
El `montoInicial` (efectivo que había en caja al abrir) se sumaba al total de ingresos del día, inflando el balance. No es un ingreso del negocio, es efectivo preexistente.

**Fix:**
Excluir `montoInicial` del cálculo de `ingresos.total` y `totalDia`. Se mantiene visible en la UI como referencia de efectivo físico en caja pero no afecta el balance.

---

### Bug 12 — Orden de rutas: `GET :id` capturaba `trabajador/:trabajadorId` en Turnos y `turno/:turnoId` en Facturación

**Severidad:** Crítica (endpoints inaccesibles)
**Archivos:** `backend/src/modules/turnos/turnos.controller.ts` · `backend/src/modules/facturacion/facturacion.controller.ts`

**Problema:**
Mismo patrón que Bug 6: `@Get(':id')` declarado antes que rutas específicas. En `TurnosController`, `GET /api/turnos/trabajador/:trabajadorId` nunca se alcanzaba. En `FacturacionController`, `GET /api/facturacion/turno/:turnoId` tampoco.

**Fix:**
Mover las rutas específicas antes del comodín `:id` en ambos controladores.

---

### Bug 13 — Zona horaria hardcodeada en TurnosService, FacturacionService y ReportesService

**Severidad:** Alta (rompe para tenants fuera de Colombia)
**Archivos:** `backend/src/modules/turnos/turnos.service.ts` · `backend/src/modules/facturacion/facturacion.service.ts` · `backend/src/modules/reportes/reportes.service.ts` · `backend/src/modules/reportes/reportes.controller.ts`

**Problema:**
Los filtros de fecha en `buscarTodos`, `buscarPorTrabajador` (Turnos), `buscarTodas` (Facturación) y `obtenerReporte` usaban `-05:00` fijo. El controller de reportes también usaba `America/Bogota` para calcular el día de hoy por defecto.

**Fix:**
1. Los helpers `offsetDesdeZonaHoraria` y `zonaHorariaTenant` que existían como privados en `CajaService` se promovieron a métodos públicos en `TenantsService` (`offsetDesdeZona`, `fechaDesdeZona`, `offsetParaTenant`, `fechaHoyParaTenant`).
2. Se inyectó `TenantsModule` en `TurnosModule`, `FacturacionModule` y `ReportesModule`.
3. Cada servicio ahora obtiene el offset dinámicamente desde la zona horaria del tenant.
4. El cron de cierre automático de caja se cambió de `0 23 * * *` con timezone fija a `0 * * * *` (cada hora) sin timezone, y la condición pasó de `fecha === hoy` a `fecha < hoy` para que cierre cualquier caja de un día ya pasado en la zona del tenant.

---

### Bug 14 — Zona horaria hardcodeada en el frontend (`dashboard.component.ts`)

**Severidad:** Alta (rompe para tenants fuera de Colombia)
**Archivo:** `frontangular/src/app/pages/dashboard/dashboard.component.ts`

**Problema:**
`esHoy()`, `horaStr()`, `fmtDay`, `fmtDate` y el cálculo de hora para la gráfica diaria usaban `America/Bogota` o el offset UTC-5 fijo.

**Fix:**
Se inyectó `TenantService` en el componente. Se reemplazaron las funciones de módulo por métodos de instancia que leen `tenantSvc.configActual?.zonaHoraria` (ya populado por el layout antes de que el dashboard renderice). La gráfica de horas usa `Intl.DateTimeFormat` con la zona del tenant en lugar del cálculo manual de UTC-5.

---

### Bug 15 — Tipo `Cliente` en frontend incompleto (faltaba `cedula`)

**Severidad:** Media
**Archivo:** `frontangular/src/app/shared/types/index.ts`

**Problema:**
La interfaz `Cliente` no declaraba el campo `cedula`, aunque el backend lo devuelve.

**Fix:**
Agregar `cedula: string | null` a la interfaz.

---

### Bug 16 — Método `buscarPorTurno` faltaba en `FacturacionService` del frontend

**Severidad:** Media
**Archivo:** `frontangular/src/app/core/services/facturacion.service.ts`

**Problema:**
El backend expone `GET /api/facturacion/turno/:turnoId` pero el servicio Angular no tenía el método correspondiente.

**Fix:**
Agregar `buscarPorTurno(turnoId: string): Promise<Factura>`.

---

## 📝 Deuda técnica relacionada

- **JWT strategy**: agregar validación de `tenantId` del payload vs. el de la BD cuando se implemente login multi-tenant por slug/subdominio (Capa 3+).
- **Transiciones de turno**: validar estados permitidos en el frontend antes de llamar al backend para mejorar UX.

---

### Bug 11 — App móvil: clientes no aparecían al crear turno

**Síntoma:** Al abrir "Nuevo Turno" en la app Flutter, la lista de clientes aparecía vacía aunque la caja estuviera abierta.

**Causa raíz (2 problemas encadenados):**

1. **Retorno temprano en `_cargarDatos()`**: el código original verificaba el estado de la caja _antes_ de cargar los datos. Si la caja estaba cerrada o nula, hacía `return` inmediatamente sin cargar clientes, servicios ni trabajadores. Resultado: al reabrir la caja y volver a la pantalla, todo seguía vacío.

2. **Cast de `precio` en `Servicio.fromJson`**: PostgreSQL devuelve columnas de tipo `numeric` como strings (`"5000.00"`) a través del driver `pg`. El código usaba `(json['precio'] as num).toDouble()` que lanzaba un `TypeError`. Esto hacía fallar el `Future.wait` completo (que carga clientes, servicios, usuarios y caja al mismo tiempo), dejando `_clientes` vacío sin mostrar ningún error visible.

**Fix aplicado:**

- `nuevo_turno_screen.dart`: se carga todo en paralelo siempre; el flag `_cajaCerrada` solo determina qué pantalla mostrar, no si cargar los datos.
- `servicio.dart` (modelo): `precio: double.tryParse(json['precio'].toString()) ?? 0.0` — maneja tanto string como number.
- Se agregó display de error con botón "Reintentar" en el paso 1 para hacer visibles futuros errores de carga.
