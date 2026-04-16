# App Móvil — Resumen y Configuración de Conexión

## Qué es

La app móvil (`applavadero/`) es una aplicación Flutter para Android que replica las funcionalidades operativas del sistema web, pensada para usar desde el teléfono en el local.

---

## Funcionalidades implementadas

| Pantalla | Acceso | Qué hace |
|----------|--------|----------|
| Login | Todos | Autenticación con email/contraseña. Guarda el JWT en `flutter_secure_storage`. |
| Dashboard | Admin | Resumen del día: turnos pendientes, en proceso, completados e ingresos del día. |
| Turnos | Admin | Lista de turnos con filtro por estado. Permite ver detalle, cambiar estado y cobrar. |
| Mis Turnos | Trabajador | Solo los turnos asignados al trabajador logueado. |
| Caja | Admin | Abrir/cerrar/reabrir caja. Registrar gastos e ingresos manuales. Ver resumen. |
| Clientes | Admin | Lista de clientes con búsqueda. Ver detalle y vehículos. Crear cliente. |
| Nuevo Turno | Admin | Wizard de 3 pasos: cliente+vehículo → servicio → fecha/hora/trabajador. |
| Cobrar | Admin | Cobra un turno y registra el método de pago. |
| Perfil | Todos | Ver datos del usuario. Cambiar contraseña. Cerrar sesión. |
| Personal | Admin | Listar, crear, editar y activar/desactivar trabajadores. |
| Servicios | Admin | Listar, crear, editar, activar/desactivar y eliminar servicios. |

---

## Roles y navegación

- **Admin** → bottom nav con 5 tabs: Inicio / Turnos / Caja / Clientes / Perfil
- **Trabajador** → bottom nav con 2 tabs: Mis Turnos / Perfil

El sistema detecta el rol al hacer login y redirige al shell correspondiente.

---

## Configuración de conexión

La app se conecta al backend NestJS vía HTTP usando **Dio**. La URL base está hardcodeada en:

```
applavadero/lib/core/api/api_endpoints.dart
```

```dart
const String kBaseUrl = 'http://192.168.1.10:3000';
```

### Requisito de red

El teléfono y la PC deben estar **en la misma red WiFi**. La IP `192.168.1.10` es la IP local de la PC en esa red.

### Cómo cambiar la IP

1. En la PC, ejecutar `ipconfig` (Windows) o `ip a` (Linux/Mac)
2. Copiar la IPv4 de la interfaz WiFi (algo como `192.168.X.X`)
3. Editar `kBaseUrl` en `api_endpoints.dart`
4. Recompilar e instalar: `flutter run -d <device-id> --no-pub`

### Obtener el device ID del teléfono

```bash
flutter devices
```

El ID es algo como `in8tscdexojjcyvk`.

---

## Autenticación

- El JWT se guarda con `flutter_secure_storage` (almacenamiento seguro del SO).
- Cada request HTTP incluye el header `Authorization: Bearer <token>`.
- Si el token es inválido o expira, el backend responde 401 y la app debe volver al login (el redirect es manual — ruta `/login`).
- El token contiene `{ sub, email, rol, tenantId }`.

---

## Notificaciones WhatsApp

Al crear un turno, si el cliente tiene teléfono registrado, la app abre WhatsApp con un mensaje pre-armado usando `url_launcher`. El número se normaliza al formato colombiano `57XXXXXXXXXX`.

---

## Cómo levantar para desarrollo

### 1. Servicios necesarios (en la PC)

```bash
# Base de datos
docker compose up -d

# Backend
cd backend && npm run start:dev
```

### 2. Instalar en el teléfono

```bash
cd applavadero

# Primera vez o después de flutter clean:
flutter pub get

# Instalar y correr con logs:
flutter run -d in8tscdexojjcyvk --no-pub

# Solo compilar el APK sin conectar:
flutter build apk --no-pub
```

### 3. Hot reload

Con `flutter run` activo, presionar `r` en la terminal para hot reload o `R` para hot restart.

---

## Estructura de carpetas

```
applavadero/
├── lib/
│   ├── app.dart                  # Router (GoRouter) + providers globales
│   ├── main.dart                 # Entry point
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart   # Dio + interceptor JWT
│   │   │   └── api_endpoints.dart # URLs + kBaseUrl
│   │   ├── auth/
│   │   │   ├── auth_provider.dart # Estado del usuario logueado
│   │   │   └── token_storage.dart # flutter_secure_storage
│   │   ├── models/               # Clases de dominio (Cliente, Turno, Caja, etc.)
│   │   └── services/             # Llamadas HTTP (ClienteService, TurnoService, etc.)
│   ├── features/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── turnos/               # TurnosScreen, DetalleTurno, NuevoTurno, Cobrar
│   │   ├── caja/
│   │   ├── clientes/
│   │   ├── perfil/
│   │   ├── personal/             # Admin: gestión de trabajadores
│   │   └── servicios/            # Admin: gestión de servicios/precios
│   └── shared/
│       ├── theme/                # Colores y tema Material
│       ├── utils/                # formatters, whatsapp URL helper
│       └── widgets/              # BotonPrimario, InputField, LoadingOverlay
├── pubspec.yaml
└── android/
```

---

## Dependencias clave

| Paquete | Para qué |
|---------|----------|
| `dio` | HTTP client con interceptors |
| `go_router` | Navegación declarativa con rutas nombradas |
| `provider` | State management (ChangeNotifier) |
| `flutter_secure_storage` | Guardar el JWT de forma segura |
| `url_launcher` | Abrir WhatsApp con mensaje pre-armado |
