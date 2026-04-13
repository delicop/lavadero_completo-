# Mi Perfil — `mi-perfil.component.ts`

**Ruta:** `/mi-perfil`
**Archivo:** `frontangular/src/app/pages/mi-perfil/mi-perfil.component.ts`
**Ver también:** [[../03 - Las páginas]] | [[_indice]]
**Módulos backend que usa:** [[../backend/auth]] · [[../backend/usuarios]]

El usuario logueado puede ver sus datos y cambiar su contraseña. Los trabajadores también ven sus liquidaciones.

---

## Servicios inyectados

| Propiedad | Servicio | Para qué |
|-----------|----------|----------|
| `auth` | `AuthService` | Cambiar contraseña |
| `sesion` | `SesionService` | Obtener datos del usuario logueado (del token JWT) |
| `liquidacionSvc` | `LiquidacionService` | Traer las liquidaciones propias del trabajador |

---

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `usuario` | `Usuario \| null` | Datos del usuario actual |
| `liquidaciones` | `Liquidacion[]` | Liquidaciones propias (para trabajadores) |
| `pwdActual` | `string` | Campo de contraseña actual |
| `pwdNueva` | `string` | Campo de contraseña nueva |
| `pwdConfirmar` | `string` | Campo de confirmación |
| `guardandoPwd` | `boolean` | Deshabilita el botón mientras se procesa |
| `msgPwd` | `string` | Mensaje de éxito o error |
| `msgPwdTipo` | `'ok' \| 'error'` | Controla el color del mensaje |

---

## Getter

### `iniciales`
Devuelve las iniciales del nombre y apellido en mayúsculas (ej: `"JP"`).
Usado en el avatar del perfil.

---

## Métodos

### `ngOnInit()`
Lee el usuario desde `sesion.obtener()`.
Intenta cargar las liquidaciones con `liquidacionSvc.mias()`.
Si falla (trabajador sin liquidaciones), no muestra error — simplemente queda vacío.

---

### `cambiarPassword()` — cambiar la contraseña propia
1. Verifica que `pwdNueva === pwdConfirmar`. Si no coinciden: muestra error sin llamar a la API.
2. Llama a `auth.cambiarPassword(pwdActual, pwdNueva)`.
3. Si tiene éxito: limpia los campos y muestra mensaje de éxito verde.
4. Si falla: muestra `"Contraseña actual incorrecta"` en rojo.
Usa `guardandoPwd` para prevenir doble click.
**Llamado por:** botón "Cambiar contraseña".

---

### `fechaCorta(iso)` — formatear fecha de liquidación
Convierte fecha ISO a texto legible en español.
Ejemplo: `"13 abr. 2026"`.
**Llamado por:** el template para las fechas de las liquidaciones.
