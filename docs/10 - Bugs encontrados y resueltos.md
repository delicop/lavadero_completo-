# 🐛 Bugs encontrados y resueltos

> Última actualización: abril 2026 — Revisión realizada con análisis estático + revisión manual de código

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

## 📝 Deuda técnica relacionada

- **JWT strategy**: agregar validación de `tenantId` del payload vs. el de la BD cuando se implemente login multi-tenant por slug/subdominio (Capa 3+).
- **Transiciones de turno**: validar estados permitidos en el frontend antes de llamar al backend para mejorar UX.
- **`console.log` de debug**: quitar los `[PERF]` del backend y `[CAJA] ngOnInit START` del frontend antes de producción (ya documentado en `06 - Estado actual.md`).

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
