# Asistencia — `asistencia.component.ts`

**Ruta:** `/asistencia`
**Archivo:** `frontangular/src/app/pages/asistencia/asistencia.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]] | [[configuracion]]
**Módulos backend que usa:** [[../backend/auth]] · [[../backend/usuarios]]

Muestra el estado de disponibilidad de los trabajadores y el historial de logins (quién entró al sistema y cuándo).

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `authSvc` | `AuthService` | Historial de logins |
| `usuarioSvc` | `UsuarioService` | Lista de trabajadores |

---

## Funciones locales (fuera de la clase)

### `formatFechaAsistencia(iso)`
Formatea una fecha ISO a texto completo: día, mes, año, hora y minuto.
Ejemplo: `"13 abr. 2026, 09:30"`.

### `formatFechaCorta(iso)`
Si la fecha es de hoy: devuelve solo la hora (`"09:30"`).
Si es de otro día: devuelve día y mes (`"13 abr."`).
Usado en la columna de la tabla de logins recientes.

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `trabajadores` | `Usuario[]` | Solo los activos con rol `trabajador` |
| `logs` | `LoginLog[]` | Historial completo de logins (hasta 200) |
| `logsRecientes` | `LoginLog[]` | Los primeros 10 del historial |
| `cargando` | `boolean` | Indicador de carga |

---

## Getters

### `disponibles`
Filtra `trabajadores` donde `disponible === true`.
**Usado en:** la sección "En turno" de la pantalla.

### `noDisponibles`
Filtra `trabajadores` donde `disponible === false`.
**Usado en:** la sección "Fuera de turno".

---

## Métodos

### `ngOnInit()`
Llama a `cargar()`.

---

### `cargar()` — cargar datos en paralelo
Llama en paralelo:
- `usuarioSvc.listar()` → filtra por `rol === 'trabajador' && activo` → `trabajadores`
- `authSvc.historialLogin(200)` → `logs`

También asigna `logsRecientes = logs.slice(0, 10)`.
