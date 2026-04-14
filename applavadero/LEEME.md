# App Móvil — Lavadero

App Flutter para gestión de turnos del lavadero. Se conecta al backend NestJS existente via REST + WebSocket usando la red WiFi local.

---

## Requisitos previos

- Flutter 3.x instalado ([flutter.dev](https://flutter.dev))
- Android Studio o VS Code con extensión Flutter
- El backend NestJS corriendo en la misma red WiFi
- Un teléfono Android conectado por USB (para instalar) o el emulador de Android Studio

---

## Configurar la IP del backend

Antes de compilar, abrí el archivo:

```
applavadero/lib/core/api/api_endpoints.dart
```

Cambiá la constante `kBaseUrl` con la IP local de la PC donde corre el backend:

```dart
const String kBaseUrl = 'http://192.168.1.10:3000';
//                               ^^^^^^^^^^^
//                               Reemplazá con tu IP local
```

**Cómo obtener tu IP local:**
- Windows: `ipconfig` en la terminal → buscá "Dirección IPv4"
- macOS/Linux: `ifconfig` → buscá `inet` en la interfaz WiFi

> El teléfono y la PC deben estar conectados al **mismo WiFi**.

---

## Instalar dependencias

```bash
cd applavadero
flutter pub get
```

---

## Levantar el backend (necesario para que la app funcione)

Desde la raíz del proyecto:

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend (en otra terminal)
cd backend
npm run start:dev
```

El backend queda escuchando en `http://localhost:3000/api`.

Si es la primera vez, creá el usuario admin:

```bash
cd backend
npm run seed
```

Credenciales por defecto: `admin@lavadero.com` / `Admin1234`

---

## Correr la app en modo desarrollo

Con el teléfono conectado por USB (modo depuración activado):

```bash
cd applavadero
flutter run
```

O desde VS Code / Android Studio: presioná F5 o el botón "Run".

---

## Generar APK para instalar manualmente

```bash
cd applavadero
flutter build apk --debug
```

El APK queda en:
```
applavadero/build/app/outputs/flutter-apk/app-debug.apk
```

**Instalar en el teléfono conectado por USB:**

```bash
# Verificar que el dispositivo está conectado
adb devices

# Instalar
adb install -r build/app/outputs/flutter-apk/app-debug.apk
```

> Para que `adb` funcione desde terminal, agregá al PATH:
> `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk\platform-tools`

---

## Estructura de carpetas

```
applavadero/
├── lib/
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart       # Cliente HTTP (Dio) con interceptor JWT
│   │   │   └── api_endpoints.dart    # Constantes de rutas + IP base
│   │   ├── auth/
│   │   │   ├── auth_provider.dart    # Estado de sesión (login/logout)
│   │   │   └── token_storage.dart    # Guarda el JWT en almacenamiento seguro
│   │   ├── models/                   # Clases de datos (mapean las respuestas del backend)
│   │   │   ├── usuario.dart
│   │   │   ├── cliente.dart
│   │   │   ├── vehiculo.dart
│   │   │   ├── servicio.dart
│   │   │   ├── turno.dart
│   │   │   ├── factura.dart
│   │   │   └── caja.dart
│   │   └── services/                 # Llamadas a la API REST
│   │       ├── auth_service.dart
│   │       ├── turno_service.dart
│   │       ├── cliente_service.dart
│   │       ├── vehiculo_service.dart
│   │       ├── servicio_service.dart
│   │       ├── caja_service.dart
│   │       ├── facturacion_service.dart
│   │       └── realtime_service.dart
│   ├── features/                     # Pantallas agrupadas por función
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── turnos/
│   │   ├── caja/
│   │   ├── clientes/
│   │   └── perfil/
│   ├── shared/
│   │   ├── theme/                    # Colores y tema visual
│   │   ├── utils/                    # Formatters (pesos, fechas)
│   │   └── widgets/                  # Componentes reutilizables
│   ├── app.dart                      # Router + providers globales
│   └── main.dart                     # Punto de entrada
└── android/
    └── app/
        └── build.gradle.kts          # applicationId: com.lavadero.applavadero
```

---

## Pantallas disponibles

| Pantalla | Ruta | Rol |
|---|---|---|
| Login | `/login` | Todos |
| Dashboard | `/dashboard` | Admin |
| Turnos del día | `/turnos` | Admin |
| Detalle de turno | `/turnos/:id` | Admin |
| Nuevo turno | `/turnos/nuevo` | Admin |
| Cobrar turno | `/turnos/:id/cobrar` | Admin |
| Caja | `/caja` | Admin |
| Clientes | `/clientes` | Admin |
| Detalle cliente | `/clientes/:id` | Admin |
| Nuevo cliente | `/clientes/nuevo` | Admin |
| Perfil | `/perfil` | Admin |
| Mis turnos (trabajador) | `/mis-turnos` | Trabajador |
| Perfil trabajador | `/perfil-trabajador` | Trabajador |

Después del login, la app redirige automáticamente según el rol:
- `admin` → `/dashboard`
- `trabajador` → `/mis-turnos`

---

## Servicios — cómo funcionan

### ApiClient (`core/api/api_client.dart`)

Wrappea `Dio` con un interceptor que adjunta el JWT en cada request:

```
Authorization: Bearer <token>
```

Los errores HTTP se convierten en `ApiException` con `mensaje` y `statusCode`.

---

### AuthService (`core/services/auth_service.dart`)

| Método | Endpoint | Descripción |
|---|---|---|
| `login(email, password)` | `POST /api/auth/login` | Retorna `{ accessToken }` |
| `getMe()` | `GET /api/auth/me` | Retorna el usuario autenticado |
| `cambiarPassword(actual, nueva)` | `PATCH /api/auth/cambiar-password` | Cambia la contraseña |
| `getUsuarios()` | `GET /api/usuarios` | Lista todos los usuarios activos |

---

### TurnoService (`core/services/turno_service.dart`)

| Método | Endpoint | Descripción |
|---|---|---|
| `getTurnos({fechaDesde, fechaHasta, estado})` | `GET /api/turnos` | Turnos del período (admin) |
| `getTurnosPorTrabajador(id, {fechaDesde, fechaHasta})` | `GET /api/turnos/trabajador/:id` | Turnos de un trabajador |
| `getTurno(id)` | `GET /api/turnos/:id` | Detalle con relaciones |
| `crearTurno(data)` | `POST /api/turnos` | Crea un nuevo turno |
| `cambiarEstado(id, estado)` | `PATCH /api/turnos/:id/estado` | Avanza el estado del turno |

**Estados válidos:** `pendiente → en_proceso → completado` (o `cancelado` desde cualquiera)

---

### ClienteService y VehiculoService

| Método | Endpoint |
|---|---|
| `getClientes()` | `GET /api/clientes` |
| `getCliente(id)` | `GET /api/clientes/:id` |
| `crearCliente(data)` | `POST /api/clientes` |
| `getVehiculos(clienteId)` | `GET /api/vehiculos/cliente/:clienteId` |
| `crearVehiculo(data)` | `POST /api/vehiculos` |

---

### CajaService (`core/services/caja_service.dart`)

| Método | Endpoint | Descripción |
|---|---|---|
| `getEstado()` | `GET /api/caja/estado` | Retorna `{ cajaHoy, cajaSinCerrar }` |
| `abrir(montoInicial)` | `POST /api/caja/abrir` | Abre la caja del día |
| `cerrar(id)` | `POST /api/caja/cerrar/:id` | Cierra la caja |
| `registrarGasto(desc, monto)` | `POST /api/caja/gastos` | Registra un gasto |
| `eliminarGasto(id)` | `DELETE /api/caja/gastos/:id` | Elimina un gasto |

---

### FacturacionService (`core/services/facturacion_service.dart`)

| Método | Endpoint | Descripción |
|---|---|---|
| `facturar(turnoId, metodoPago, total)` | `POST /api/facturacion` | Crea la factura y cobra el turno |

**Métodos de pago:** `efectivo`, `transferencia`, `debito`, `credito`

---

### RealtimeService (`core/services/realtime_service.dart`)

Usa `socket.io-client` para recibir actualizaciones en tiempo real desde el backend:

- `onTurnoActualizado` → stream que emite cuando un turno cambia estado
- Los providers `DashboardProvider` y `TurnosProvider` se suscriben a este stream para refrescar la lista sin necesidad de hacer pull-to-refresh manual

---

## AuthProvider — flujo de sesión

```
Login:
  1. POST /api/auth/login → { accessToken }
  2. Guarda el token en flutter_secure_storage
  3. GET /api/auth/me → usuario completo
  4. Redirige según rol

Logout:
  1. Elimina el token del storage
  2. Redirige a /login

Verificar sesión (al abrir app):
  1. Lee el token guardado
  2. Si existe → GET /api/auth/me para cargar el usuario
  3. Si falla (token expirado) → elimina token y redirige a /login
```

---

## Dependencias principales

| Paquete | Versión | Para qué se usa |
|---|---|---|
| `dio` | ^5.4.0 | Cliente HTTP con interceptores |
| `socket_io_client` | ^2.0.3+1 | WebSocket tiempo real |
| `flutter_secure_storage` | ^9.0.0 | Almacenamiento seguro del JWT |
| `go_router` | ^13.0.0 | Navegación declarativa |
| `provider` | ^6.1.2 | Manejo de estado |
| `intl` | ^0.19.0 | Formateo de pesos colombianos y fechas |

---

## Notas importantes

### IDs son UUID (string)
Todos los recursos del backend usan UUID como ID primario (formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). Los modelos Flutter usan `String` para todos los campos de ID, nunca `int`.

### Respuestas del backend sin wrapper
El backend NestJS retorna los datos directamente — sin el envelope `{ data: [...] }`. Los servicios Flutter leen `res as List` o `res as Map<String, dynamic>` directamente.

### `comisionPorcentaje` viene como string
PostgreSQL retorna campos `numeric` como string (`"50.00"`). El modelo `Usuario` lo parsea con `double.tryParse()`.

### Red WiFi
La app se conecta a la IP local de la PC donde corre el backend. Ambos dispositivos deben estar en la misma red. Si cambia la IP (por ejemplo al conectarse a otra red), hay que actualizar `kBaseUrl` en `api_endpoints.dart` y recompilar.
