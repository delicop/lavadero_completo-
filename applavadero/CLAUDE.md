# CLAUDE.md — App Lavadero Android (Kotlin + Jetpack Compose)

> Este archivo es leído automáticamente por Claude Code al inicio de cada sesión.
> Contiene todo el contexto del proyecto para arrancar sin preguntas.

---

## ¿Qué es este proyecto?

App Android nativa en **Kotlin + Jetpack Compose** para gestionar un lavadero de autos.
Es la migración del proyecto Flutter `applavadero` al stack Android nativo.
Consume el **mismo backend NestJS** existente — no se toca el backend.

**Nombre del proyecto Android Studio:** `AppLavadero`
**Package:** `com.lavadero.app`
**Min SDK:** 26 | **Target SDK:** 34

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| **admin** | Dashboard, Turnos, Caja, Clientes, Perfil |
| **trabajador** | Mis Turnos, Perfil |

La redirección por rol ocurre inmediatamente después del login.

---

## Backend

- **URL producción (Hangar Services — Oracle Cloud):** `http://129.80.17.68:3000`
- **URL local (emulador):** `http://10.0.2.2:3000`
- **URL dispositivo físico:** `http://192.168.1.X:3000` (IP local de la PC)
- **Autenticación:** JWT en header `Authorization: Bearer <token>`
- **WebSocket:** `ws://129.80.17.68:3000` — eventos: `turno_actualizado`, `usuario_actualizado`

### Endpoints disponibles

```
POST   /api/auth/login
PATCH  /api/auth/cambiar-password

GET    /api/turnos?fecha=YYYY-MM-DD&estado=X&trabajadorId=X
POST   /api/turnos
PATCH  /api/turnos/:id/estado
GET    /api/turnos/:id

GET    /api/clientes
POST   /api/clientes
GET    /api/clientes/:id

GET    /api/vehiculos/cliente/:clienteId
POST   /api/vehiculos

GET    /api/servicios

GET    /api/caja/estado
POST   /api/caja/abrir
GET    /api/caja/:id/resumen
POST   /api/caja/gasto
DELETE /api/caja/gasto/:id
POST   /api/caja/ingreso-manual
POST   /api/caja/:id/cerrar

GET    /api/usuarios                (solo admin)
PATCH  /api/usuarios/:id            (solo admin)
```

---

## Stack tecnológico

| Necesidad | Librería |
|---|---|
| UI | Jetpack Compose + Material3 |
| Navegación | Navigation Compose |
| Estado | ViewModel + StateFlow |
| HTTP | Retrofit + OkHttp |
| JWT storage | EncryptedSharedPreferences |
| WebSockets | socket.io-client-java |
| DI | Hilt |
| Async | Kotlin Coroutines |
| Formateo | NumberFormat (java.text) + DateTimeFormatter |

---

## Arquitectura

**Patrón:** MVVM (Model-View-ViewModel)

- `Screen.kt` → solo UI con Compose, sin lógica
- `ViewModel.kt` → lógica, llama a services, expone StateFlow
- `Service.kt` → llamadas a la API via Retrofit
- `Model.kt` → data class con @SerializedName para Gson

**Reglas:**
- Nunca lógica de negocio en los Composables
- Siempre usar `viewModelScope.launch {}` para operaciones async
- Los errores se exponen como `String?` en el UiState y se muestran con SnackBar
- Confirmar siempre antes de cobrar o cerrar caja

---

## Estructura de carpetas

```
app/src/main/java/com/lavadero/app/
├── core/
│   ├── network/
│   │   ├── ApiClient.kt        ← Retrofit singleton
│   │   ├── ApiService.kt       ← Todos los endpoints como interface
│   │   └── AuthInterceptor.kt  ← Inyecta Bearer token
│   ├── auth/
│   │   ├── TokenStorage.kt     ← EncryptedSharedPreferences
│   │   └── AuthViewModel.kt    ← Estado global de auth
│   └── services/
│       ├── TurnoService.kt
│       ├── ClienteService.kt
│       ├── VehiculoService.kt
│       ├── ServicioService.kt
│       ├── CajaService.kt
│       └── RealtimeService.kt
├── core/models/
│   ├── Usuario.kt
│   ├── Cliente.kt
│   ├── Vehiculo.kt
│   ├── Servicio.kt
│   ├── Turno.kt
│   ├── Factura.kt
│   └── Caja.kt
├── features/
│   ├── login/        LoginScreen.kt + LoginViewModel.kt
│   ├── dashboard/    DashboardScreen.kt + MisTurnosScreen.kt + DashboardViewModel.kt
│   ├── turnos/       TurnosScreen + DetalleTurno + NuevoTurno + Cobrar + ViewModel
│   ├── caja/         CajaScreen.kt + CajaViewModel.kt
│   ├── clientes/     ClientesScreen + ClienteDetalle + ClientesViewModel
│   └── perfil/       PerfilScreen.kt + PerfilViewModel.kt
├── shared/
│   ├── components/   EstadoChip, CardTurno, InputField, BotonPrimario, LoadingOverlay, EmptyState
│   ├── theme/        Color.kt + Theme.kt
│   └── utils/        Formatters.kt
├── navigation/
│   └── AppNavigation.kt
└── MainActivity.kt
```

---

## Rutas de navegación

```
login
dashboard              ← admin
mis-turnos             ← trabajador
turnos
turnos/nuevo
turnos/{id}
turnos/{id}/cobrar
caja
clientes
clientes/{id}
perfil
```

---

## Paleta de colores

```kotlin
ColorPrimario   = Color(0xFF1E88E5)  // azul
ColorFondo      = Color(0xFF121212)  // fondo oscuro
ColorSuperficie = Color(0xFF1E1E1E)  // cards
ColorTexto      = Color(0xFFFFFFFF)
ColorSubtexto   = Color(0xFFB0B0B0)
ColorPendiente  = Color(0xFFFF9800)  // naranja
ColorEnProceso  = Color(0xFF2196F3)  // azul
ColorCompletado = Color(0xFF4CAF50)  // verde
ColorCancelado  = Color(0xFFEF5350)  // rojo
```

**Tema:** oscuro, diseñado para usarse con manos mojadas o con guantes.
**Botones mínimo:** 48dp de altura.

---

## Estados de un turno

```
pendiente → en_proceso → completado → (facturado)
                       ↘ cancelado
```

El botón de acción en DetalleTurnoScreen cambia según el estado:
- `pendiente` → "Marcar En Proceso"
- `en_proceso` → "Marcar Completado"
- `completado` → "Cobrar" (solo admin, si no tiene factura)
- `cancelado` → sin botón

---

## Formateo de datos (Colombia)

```kotlin
// Pesos: 25000 → "$25.000"
fun formatearPesos(monto: Number): String

// Fecha: ISO → "domingo 13 de abril"
fun formatearFecha(isoDate: String): String

// Hora: ISO → "10:30"
fun formatearHora(isoDate: String): String
```

Locale: `Locale("es", "CO")`

---

## Orden de implementación

```
1.  Proyecto Android Studio creado (Empty Activity + Compose)
2.  build.gradle con todas las dependencias
3.  LavaderoTheme configurado
4.  TokenStorage
5.  ApiClient + AuthInterceptor
6.  ApiService (interface con todos los endpoints)
7.  Modelos (data class)
8.  LoginViewModel + LoginScreen
9.  AppNavigation con redirección por rol
10. DashboardScreen (admin) + ViewModel
11. MisTurnosScreen (trabajador)
12. DetalleTurnoScreen + cambio de estado
13. NuevoTurnoScreen (wizard 3 pasos)
14. CobrarScreen (facturar)
15. CajaScreen
16. ClientesScreen + ClienteDetalleScreen
17. PerfilScreen
18. RealtimeService (Socket.IO)
19. Conectar WebSocket a Dashboard y Turnos
20. Pulir UX: animaciones, empty states, manejo offline
```

---

## Notas importantes

- El emulador Android usa `10.0.2.2` en lugar de `localhost` para acceder al backend de la PC
- En dispositivo físico usar la IP local de la PC (misma red WiFi)
- Confirmar siempre antes de cobrar un turno o cerrar la caja
- Los SnackBar son el mecanismo principal para mostrar errores al usuario
- El developer es de Flutter — conoce Compose bien, los conceptos son similares
- Este proyecto es exclusivamente para Android (no iOS), por eso se eligió nativo sobre Flutter
