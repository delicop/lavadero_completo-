# APPMOVIL.md — App Móvil Flutter para Lavadero

## ¿Qué es y para qué sirve?

La app móvil es una interfaz optimizada para celular que se conecta al **mismo backend NestJS** que ya existe. No requiere ningún cambio en el backend — consume los mismos endpoints REST y el mismo WebSocket.

El objetivo es que tanto el **admin** como los **trabajadores** puedan operar el lavadero desde el celular de forma rápida e intuitiva, sin necesidad de estar frente a la computadora.

**No es un reemplazo del panel web** — es un complemento pensado para el trabajo en campo (el piso del lavadero).

---

## Stack tecnológico

| Herramienta | Decisión | Por qué |
|---|---|---|
| Framework | Flutter | Multiplataforma (Android + iOS) con un solo código |
| Lenguaje | Dart | Obligatorio con Flutter |
| HTTP | `dio` | Interceptores de JWT más limpios que el paquete `http` |
| WebSockets | `socket_io_client` | El backend usa Socket.IO — mismo protocolo |
| Auth storage | `flutter_secure_storage` | Guarda el JWT encriptado en el keychain del dispositivo |
| Navegación | `go_router` | Declarativa, soporta deep linking y redirecciones |
| Estado | `provider` | Simple, suficiente para este proyecto, bueno para aprender |
| UI base | Material Design 3 | Nativo de Flutter, componentes conocidos y accesibles |
| Formateo de pesos | `intl` | Para mostrar `$25.000` en formato colombiano |

---

## Lo que se conecta: el backend existente

La app consume exactamente estos endpoints (ya implementados):

```
POST   /api/auth/login
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
PATCH  /api/auth/cambiar-password
```

WebSocket: `ws://TU_HOST:3000` — eventos `turno_actualizado` y `usuario_actualizado`

---

## Pantallas por rol

### 👷 Trabajador (acceso operativo)

| Pantalla | Descripción |
|---|---|
| Login | Ingresar con email y contraseña |
| Mis Turnos | Ver sus turnos del día, cambiar estado |
| Detalle de Turno | Ver info completa + botón de avanzar estado |
| Mi Perfil | Ver sus datos, cambiar contraseña |

### 👑 Admin (acceso completo)

| Pantalla | Descripción |
|---|---|
| Login | Ingresar con email y contraseña |
| Dashboard | Resumen del día: turnos + dinero del día |
| Turnos | Lista de todos los turnos, filtros, crear nuevo |
| Crear Turno | Flujo guiado: cliente → vehículo → servicio → trabajador |
| Detalle de Turno | Info completa + cambiar estado + cobrar |
| Cobrar (Facturar) | Elegir método de pago y confirmar |
| Caja | Estado de la caja: abrir / registrar gastos / cerrar |
| Clientes | Lista de clientes + crear nuevo |
| Perfil del Cliente | Sus vehículos, crear vehículo nuevo |
| Mi Perfil | Ver datos, cambiar contraseña |

---

## Navegación — estructura general

La navegación principal usa un **Bottom Navigation Bar** con las secciones más usadas. Las secciones secundarias se acceden desde dentro de cada pantalla.

```
┌──────────────────────────────────┐
│         Contenido de la pantalla         │
│                                          │
│                                          │
│                                          │
├──────────────────────────────────┤
│  🏠 Inicio  │  📋 Turnos  │  💰 Caja  │  👤 Perfil  │
└──────────────────────────────────┘
```

> Para el rol **trabajador**: solo ve "Mis Turnos" y "Perfil".
> Para el rol **admin**: ve las 4 pestañas completas.

### Árbol de rutas (go_router)

```
/login
/home
  /dashboard               ← pestaña Inicio (admin)
  /mis-turnos              ← pestaña Inicio (trabajador)
  /turnos                  ← pestaña Turnos (admin)
    /turnos/nuevo          ← flujo crear turno
    /turnos/:id            ← detalle de turno
    /turnos/:id/cobrar     ← facturar turno
  /caja                    ← pestaña Caja (admin)
  /clientes                ← accesible desde Turnos / Inicio (admin)
    /clientes/:id          ← perfil del cliente con sus vehículos
    /clientes/nuevo
  /perfil                  ← pestaña Perfil
```

---

## Estructura de carpetas del proyecto Flutter

```
applavadero/
├── lib/
│   ├── main.dart                        ← bootstrap de la app
│   ├── app.dart                         ← MaterialApp + go_router
│   │
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart          ← instancia de Dio con interceptor JWT
│   │   │   └── api_endpoints.dart       ← constantes de URLs
│   │   ├── auth/
│   │   │   ├── auth_provider.dart       ← estado de autenticación (ChangeNotifier)
│   │   │   └── token_storage.dart       ← flutter_secure_storage
│   │   ├── services/
│   │   │   ├── auth_service.dart        ← login, cambiar password
│   │   │   ├── turno_service.dart       ← CRUD turnos
│   │   │   ├── cliente_service.dart     ← CRUD clientes
│   │   │   ├── vehiculo_service.dart    ← CRUD vehículos
│   │   │   ├── servicio_service.dart    ← catálogo de servicios
│   │   │   ├── caja_service.dart        ← caja del día
│   │   │   ├── facturacion_service.dart ← crear facturas
│   │   │   └── realtime_service.dart    ← WebSocket Socket.IO
│   │   └── models/
│   │       ├── usuario.dart
│   │       ├── cliente.dart
│   │       ├── vehiculo.dart
│   │       ├── servicio.dart
│   │       ├── turno.dart
│   │       ├── factura.dart
│   │       └── caja.dart
│   │
│   ├── features/
│   │   ├── login/
│   │   │   ├── login_screen.dart
│   │   │   └── login_provider.dart
│   │   ├── dashboard/
│   │   │   ├── dashboard_screen.dart    ← admin
│   │   │   ├── mis_turnos_screen.dart   ← trabajador
│   │   │   └── dashboard_provider.dart
│   │   ├── turnos/
│   │   │   ├── turnos_screen.dart
│   │   │   ├── detalle_turno_screen.dart
│   │   │   ├── nuevo_turno_screen.dart
│   │   │   ├── cobrar_screen.dart
│   │   │   └── turnos_provider.dart
│   │   ├── caja/
│   │   │   ├── caja_screen.dart
│   │   │   └── caja_provider.dart
│   │   ├── clientes/
│   │   │   ├── clientes_screen.dart
│   │   │   ├── cliente_detalle_screen.dart
│   │   │   └── clientes_provider.dart
│   │   └── perfil/
│   │       ├── perfil_screen.dart
│   │       └── perfil_provider.dart
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── estado_chip.dart         ← chip de color para estado del turno
│       │   ├── card_turno.dart          ← tarjeta de turno reutilizable
│       │   ├── input_field.dart         ← campo de texto con estilo propio
│       │   ├── boton_primario.dart      ← botón principal estilizado
│       │   ├── loading_overlay.dart     ← indicador de carga
│       │   └── empty_state.dart        ← "no hay turnos" etc.
│       ├── theme/
│       │   ├── colores.dart             ← paleta de colores del lavadero
│       │   └── tema.dart               ← ThemeData con tipografía y colores
│       └── utils/
│           ├── formatters.dart          ← pesos COP, fechas en español
│           └── whatsapp.dart            ← normalizar número 57XXXXXXXXXX
│
├── pubspec.yaml
├── android/
├── ios/
└── README.md
```

---

## Diseño de pantallas — especificación detallada

### Login

```
┌──────────────────────────┐
│                          │
│      🚗 Lavadero         │
│                          │
│  ┌────────────────────┐  │
│  │  Email             │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Contraseña    👁  │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │      Ingresar      │  │
│  └────────────────────┘  │
│                          │
└──────────────────────────┘
```

- El botón muestra spinner mientras espera respuesta
- Si el login falla, muestra el error debajo del formulario
- Al loguear, guarda el JWT con `flutter_secure_storage`
- Redirige según el rol: admin → dashboard, trabajador → mis-turnos

---

### Dashboard (Admin)

```
┌──────────────────────────┐
│  Hola, Juan 👋   [🔔]   │
│  Domingo 13 de abril     │
│                          │
│  ┌──────┐ ┌──────┐      │
│  │  12  │ │  $0  │      │
│  │Turnos│ │Ingres│      │
│  └──────┘ └──────┘      │
│                          │
│  EN PROCESO              │
│  ┌────────────────────┐  │
│  │🚗 Toyota Corolla   │  │
│  │ Juan Pérez         │  │
│  │ Lavado básico      │  │
│  │ ● en_proceso [→]  │  │
│  └────────────────────┘  │
│                          │
│  PENDIENTES              │
│  ┌────────────────────┐  │
│  │ ...                │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  + Nuevo Turno     │  │
│  └────────────────────┘  │
│                          │
│  🏠  │  📋  │  💰  │  👤  │
└──────────────────────────┘
```

- Actualización en tiempo real via WebSocket
- Las tarjetas de turno muestran un botón [→] para avanzar el estado
- Si el turno está `completado` y sin factura → botón "Cobrar"
- Pull-to-refresh disponible

---

### Mis Turnos (Trabajador)

Igual que el Dashboard Admin pero solo muestra sus propios turnos y su ganancia estimada del día. Sin acceso a caja ni clientes.

---

### Turnos (Admin) — lista completa

```
┌──────────────────────────┐
│  Turnos           [+ ]  │
│  ┌──────────────────┐   │
│  │  📅 Hoy  ▼      │   │
│  └──────────────────┘   │
│  Estado: Todos ▼        │
│                          │
│  ┌────────────────────┐  │
│  │🚗 Toyota Corolla   │  │
│  │ Juan Pérez         │  │
│  │ Lavado completo    │  │
│  │ Pedro G.  ● pend. │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ ...                │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

- Filtro por fecha (DatePicker)
- Filtro por estado (chips: Todos / Pendiente / En proceso / Completado)
- FAB (+) para crear nuevo turno
- Tap en una tarjeta → Detalle del turno

---

### Crear Turno — flujo de pasos (Wizard)

El formulario de nuevo turno se divide en 3 pasos para no abrumar al usuario:

**Paso 1 — Cliente y Vehículo**
```
┌──────────────────────────┐
│  Nuevo Turno   1 de 3   │
│                          │
│  Buscar cliente...  🔍  │
│  ┌────────────────────┐  │
│  │  Juan Pérez        │  │
│  │  📞 57300...       │  │
│  └────────────────────┘  │
│                          │
│  Vehículo                │
│  ○ Toyota Corolla - ABC  │
│  ○ Honda Civic - XYZ     │
│                          │
│  + Agregar cliente nuevo │
│                          │
│              [Siguiente] │
└──────────────────────────┘
```

**Paso 2 — Servicio**
```
┌──────────────────────────┐
│  Nuevo Turno   2 de 3   │
│                          │
│  ┌────────────────────┐  │
│  │ Lavado básico      │  │
│  │ $15.000 · 20 min   │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ Lavado completo    │  │
│  │ $25.000 · 45 min   │  │
│  └────────────────────┘  │
│                          │
│  [Atrás]    [Siguiente]  │
└──────────────────────────┘
```

**Paso 3 — Trabajador y confirmar**
```
┌──────────────────────────┐
│  Nuevo Turno   3 de 3   │
│                          │
│  Asignar a:              │
│  ○ Pedro García          │
│  ○ Luis Torres           │
│                          │
│  Observaciones (opcional)│
│  ┌────────────────────┐  │
│  │                    │  │
│  └────────────────────┘  │
│                          │
│  [Atrás]    [Crear ✓]   │
└──────────────────────────┘
```

---

### Detalle de Turno

```
┌──────────────────────────┐
│  ←  Turno #4521          │
│                          │
│  ● EN PROCESO            │
│                          │
│  👤 Juan Pérez           │
│     📞 57300...          │
│                          │
│  🚗 Toyota Corolla       │
│     ABC-123 · Rojo       │
│                          │
│  🔧 Lavado completo      │
│     $25.000 · 45 min     │
│                          │
│  👷 Pedro García         │
│                          │
│  📝 Sin observaciones    │
│                          │
│  ┌────────────────────┐  │
│  │  ✓ Marcar como     │  │
│  │    Completado      │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

- El botón de avanzar estado adapta su texto al estado actual:
  - `pendiente` → "Marcar En Proceso"
  - `en_proceso` → "Marcar Completado"
  - `completado` → "Cobrar" (solo admin)
  - `cancelado` → sin botón

---

### Cobrar (Facturar)

```
┌──────────────────────────┐
│  ←  Cobrar               │
│                          │
│  Toyota Corolla - ABC    │
│  Lavado completo         │
│                          │
│  Total: $25.000          │
│                          │
│  Método de pago          │
│  ┌──────┐ ┌──────────┐  │
│  │Efect.│ │Transfer. │  │
│  └──────┘ └──────────┘  │
│  ┌──────┐ ┌──────────┐  │
│  │Débito│ │ Crédito  │  │
│  └──────┘ └──────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  Confirmar cobro   │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

### Caja (Admin)

La pantalla de caja adapta su contenido al estado del día:

**Estado: Sin caja abierta**
```
┌──────────────────────────┐
│  Caja                    │
│                          │
│  No hay caja abierta     │
│  para hoy.               │
│                          │
│  Monto inicial           │
│  ┌────────────────────┐  │
│  │  $50.000           │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │   Abrir caja 🔓   │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

**Estado: Caja abierta**
```
┌──────────────────────────┐
│  Caja ● ABIERTA          │
│                          │
│  Ventas hoy: $125.000    │
│  Efectivo:   $80.000     │
│  Transfer.:  $45.000     │
│  Gastos:     $20.000     │
│                          │
│  ┌──────────┐ ┌────────┐ │
│  │+ Gasto   │ │+Ingres.│ │
│  └──────────┘ └────────┘ │
│                          │
│  GASTOS DEL DÍA          │
│  · Jabón líquido $15.000 │
│                          │
│  ┌────────────────────┐  │
│  │   Cerrar caja 🔒   │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

**Estado: Caja cerrada**
Solo muestra el resumen del día en modo lectura.

---

### Clientes (Admin)

```
┌──────────────────────────┐
│  Clientes          [+ ]  │
│  ┌────────────────────┐  │
│  │ 🔍 Buscar cliente  │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │ Juan Pérez         │  │
│  │ 📞 57300...        │  │
│  │ 2 vehículos        │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ María López        │  │
│  │ 📞 57310...        │  │
│  │ 1 vehículo         │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

Tap en un cliente → ver su perfil con vehículos y opción de agregar nuevo vehículo.

---

### Mi Perfil

```
┌──────────────────────────┐
│  Mi Perfil               │
│                          │
│  👤                      │
│  Pedro García            │
│  pedro@lavadero.com      │
│  Trabajador              │
│                          │
│  ┌────────────────────┐  │
│  │  Editar perfil     │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Cambiar contraseña│  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Cerrar sesión     │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

## Configuración del proyecto

### pubspec.yaml — dependencias clave

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP y API
  dio: ^5.4.0                    # Cliente HTTP con interceptores
  
  # WebSockets (mismo protocolo que el backend)
  socket_io_client: ^2.0.3+1
  
  # Almacenamiento seguro del JWT
  flutter_secure_storage: ^9.0.0
  
  # Navegación declarativa
  go_router: ^13.0.0
  
  # Estado
  provider: ^6.1.2
  
  # Formato de fechas y moneda (COP, español)
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
```

---

## Autenticación — flujo JWT

El flujo es idéntico al del frontend web, adaptado a móvil:

```dart
// 1. Al hacer login, guardar el token
await tokenStorage.save(token);

// 2. En cada request HTTP, el interceptor de Dio adjunta el token
interceptor: (options) {
  final token = await tokenStorage.read();
  options.headers['Authorization'] = 'Bearer $token';
}

// 3. Si el backend devuelve 401 → borrar token y redirigir a login
// 4. Al cerrar sesión → borrar token de flutter_secure_storage
```

### TokenStorage

```dart
// core/auth/token_storage.dart
class TokenStorage {
  final _storage = const FlutterSecureStorage();
  static const _key = 'jwt_token';

  Future<void> save(String token) => _storage.write(key: _key, value: token);
  Future<String?> read() => _storage.read(key: _key);
  Future<void> delete() => _storage.delete(key: _key);
}
```

---

## Tiempo real — WebSockets

```dart
// core/services/realtime_service.dart
class RealtimeService {
  late IO.Socket socket;

  void conectar(String baseUrl) {
    socket = IO.io(baseUrl, OptionBuilder().setTransports(['websocket']).build());
    socket.connect();
  }

  Stream<dynamic> get onTurnoActualizado =>
      socket.on('turno_actualizado').map((data) => data);

  void desconectar() => socket.disconnect();
}
```

Cada pantalla que necesita tiempo real (Dashboard, Turnos) se suscribe al stream y llama a `setState()` o notifica al provider.

---

## Manejo de errores — patrón uniforme

Todos los servicios envuelven las llamadas a la API en un try/catch y lanzan excepciones tipadas:

```dart
// Si el backend devuelve { message: "..." }
class ApiException implements Exception {
  final String mensaje;
  final int statusCode;
  ApiException(this.mensaje, this.statusCode);
}
```

Los providers atrapan estas excepciones y exponen un `String? error` que los widgets muestran con un `SnackBar`.

---

## Paleta de colores y tema

Diseño oscuro y limpio, pensado para usarse con las manos mojadas o con guantes.

```dart
// shared/theme/colores.dart
const colorPrimario    = Color(0xFF1E88E5);  // azul
const colorFondo       = Color(0xFF121212);  // fondo oscuro
const colorSuperficie  = Color(0xFF1E1E1E);  // cards
const colorTexto       = Color(0xFFFFFFFF);  // texto principal
const colorSubtexto    = Color(0xFFB0B0B0);  // texto secundario

// Estados de turnos
const colorPendiente   = Color(0xFFFF9800);  // naranja
const colorEnProceso   = Color(0xFF2196F3);  // azul
const colorCompletado  = Color(0xFF4CAF50);  // verde
const colorCancelado   = Color(0xFFEF5350);  // rojo
```

**Consideraciones UX para el lavadero:**
- Botones grandes (mínimo 48px de altura)
- Texto legible al sol (contraste alto)
- Confirmación explícita antes de cobrar o cerrar caja
- Feedback visual inmediato con SnackBar en cada acción

---

## Formateo de datos

```dart
// shared/utils/formatters.dart

// Pesos colombianos: 25000 → "$25.000"
String formatearPesos(num monto) {
  final formatter = NumberFormat.currency(
    locale: 'es_CO',
    symbol: '\$',
    decimalDigits: 0,
  );
  return formatter.format(monto);
}

// Fecha legible: "2026-04-13T10:30:00Z" → "domingo 13 de abril"
String formatearFecha(String isoDate) {
  final fecha = DateTime.parse(isoDate).toLocal();
  return DateFormat("EEEE d 'de' MMMM", 'es').format(fecha);
}

// Hora: "2026-04-13T10:30:00Z" → "10:30"
String formatearHora(String isoDate) {
  return DateFormat('HH:mm').format(DateTime.parse(isoDate).toLocal());
}
```

---

## Cómo levantar el proyecto Flutter

### Prerequisitos

1. Instalar Flutter SDK: https://flutter.dev/docs/get-started/install
2. Verificar instalación: `flutter doctor`
3. Tener el backend corriendo en `http://localhost:3000`

### Primera vez

```bash
# Desde la raíz del repositorio
cd applavadero
flutter pub get
```

### Desarrollo en emulador Android

```bash
# Abrir emulador de Android Studio, luego:
flutter run
```

### Desarrollo en dispositivo físico

```bash
# Habilitar "Depuración USB" en el teléfono
# Conectar por cable, luego:
flutter run
```

### Build para producción

```bash
# Android (APK para distribuir)
flutter build apk --release

# Android (para Google Play)
flutter build appbundle --release

# iOS (requiere Mac con Xcode)
flutter build ios --release
```

### Variable de entorno — URL del backend

En `lib/core/api/api_endpoints.dart` definir la URL base:

```dart
// Desarrollo local (emulador Android usa 10.0.2.2 en lugar de localhost)
const String kBaseUrl = 'http://10.0.2.2:3000';

// Producción (cuando el backend esté en un servidor)
// const String kBaseUrl = 'https://api.tudominio.com';
```

> **Nota:** En Android, el emulador no puede acceder a `localhost` de la PC. Usar `10.0.2.2` que es el alias del host. En dispositivo físico, usar la IP local de la PC (ej: `192.168.1.X`) mientras ambos estén en la misma red WiFi.

---

## Guía para agregar una nueva pantalla

1. Crear carpeta en `lib/features/<nombre>/`
2. Crear `<nombre>_screen.dart` (el widget visual)
3. Crear `<nombre>_provider.dart` (el estado con ChangeNotifier)
4. Agregar la ruta en `app.dart` con `go_router`
5. Si necesita datos nuevos del backend, agregar método en el servicio correspondiente

---

## Orden de implementación recomendado

```
1. Setup inicial Flutter + dependencias + estructura de carpetas
2. ApiClient (Dio) con interceptor JWT
3. TokenStorage + AuthProvider
4. Pantalla Login → conectar con POST /api/auth/login
5. go_router con redirección según rol
6. Dashboard Admin (lista de turnos de hoy)
7. Detalle de Turno + cambiar estado
8. Crear Turno (wizard 3 pasos)
9. Cobrar (facturar turno)
10. Pantalla Caja (abrir, gastos, cerrar)
11. Pantalla Clientes
12. Mi Perfil
13. Integrar WebSockets (realtime)
14. Pantalla Mis Turnos (trabajador)
15. Pulir UX: animaciones, estados vacíos, manejo de red offline
```

---

## Relación con el proyecto principal

```
lavadero/
├── backend/          ← API que consume la app móvil (no se toca)
├── frontangular/     ← Panel web (no se toca)
├── applavadero/      ← App Flutter (nueva carpeta a crear)
├── docs/
├── CLAUDE.md
└── APPMOVIL.md       ← este archivo
```

La app móvil vive en `applavadero/` dentro del mismo repositorio. No requiere modificar ningún archivo del backend ni del frontend web.
