# App Móvil — Guía de Uso e Instalación

## ¿Qué es?

La app móvil del lavadero permite gestionar el negocio desde el teléfono: crear turnos, controlar la caja, ver clientes y administrar el personal, sin necesidad de estar en la computadora.

---

## Instalación

### La APK no está en el repositorio

El archivo `.apk` es un artefacto de compilación — no se sube a git. Para obtenerlo hay dos opciones:

---

### Opción A — Compilar desde la PC (recomendado)

**Requisitos previos:**
- Flutter SDK instalado ([flutter.dev](https://flutter.dev/docs/get-started/install))
- Android SDK (viene con Android Studio o Flutter)
- Cable USB y el teléfono con **Depuración USB activada**

**Pasos:**

```bash
# 1. Clonar o actualizar el repositorio
git clone https://github.com/delicop/lavadero_completo-
# o si ya lo tenés:
git pull origin main

# 2. Entrar a la carpeta de la app
cd applavadero

# 3. Descargar dependencias (solo la primera vez)
flutter pub get

# 4. Instalar directo en el teléfono conectado por USB
flutter run -d <device-id> --no-pub

# Para ver el device-id de tu teléfono:
flutter devices
```

**Para generar el APK sin instalar:**

```bash
cd applavadero
flutter build apk --no-pub
# El APK queda en: build/app/outputs/flutter-apk/app-release.apk
```

Ese archivo `.apk` se puede compartir por WhatsApp o Google Drive para instalar en otros teléfonos.

---

### Opción B — Instalar el APK manualmente

Si alguien ya compiló el APK y te lo pasó:

1. Copiá el archivo `app-release.apk` al teléfono
2. En el teléfono: **Ajustes → Seguridad → Instalar apps desconocidas** → activar para el gestor de archivos
3. Abrí el APK desde el gestor de archivos y seguí los pasos

---

## Configuración de conexión

La app se conecta al backend en:

```
http://129.80.17.68:3000
```

Este valor está hardcodeado en:

```
applavadero/lib/core/api/api_endpoints.dart
```

```dart
const String kBaseUrl = 'http://129.80.17.68:3000';
```

**Si cambia el servidor**, editá esa línea, guardá, y recompilá el APK.

---

## Primer uso

### Credenciales

Las credenciales son las mismas que se usan en el panel web. El usuario admin inicial se crea con:

```bash
cd backend
npm run seed
# Crea: admin@lavadero.com / Admin1234
```

### Login

Al abrir la app por primera vez aparece la pantalla de login. Ingresá con email y contraseña del sistema.

---

## Manual de uso

### Pantalla de inicio (Dashboard)

Muestra el resumen del día:
- Turnos pendientes, en proceso y completados
- Ingresos del día

### Turnos

Lista todos los turnos del día. Se puede:
- **Filtrar** por estado (pendiente / en proceso / completado / cancelado)
- **Ver detalle** de un turno tocándolo
- **Cambiar estado** desde el detalle
- **Cobrar** un turno completado

### Crear nuevo turno

Botón **+** en la pantalla de Turnos. Sigue un wizard de 3 pasos:

1. **Cliente y vehículo** — buscá el cliente por nombre o teléfono, luego elegí el vehículo
2. **Servicio** — seleccioná el tipo de servicio (precio y duración se muestran)
3. **Fecha, hora y trabajador** — elegí cuándo y a quién asignarlo (opcional)

> **Nota:** La caja del día debe estar abierta para crear turnos.

Al crear el turno, la app ofrece abrir WhatsApp para notificar al cliente automáticamente.

### Caja

Control de la caja diaria:

| Acción | Descripción |
|--------|-------------|
| **Abrir caja** | Ingresá el monto inicial en efectivo |
| **Registrar gasto** | Gastos del día (efectivo o transferencia) |
| **Registrar ingreso** | Ingresos manuales que no vienen de turnos |
| **Ver resumen** | Totales del día, efectivo en caja, ganancia por trabajador |
| **Cerrar caja** | Cierra el día — ya no se pueden crear turnos |
| **Reabrir caja** | Si cerraste por error, podés reabrirla el mismo día |

> El sistema cierra automáticamente las cajas abiertas a las 23:00 (hora Colombia).

### Clientes

Lista todos los clientes con búsqueda por nombre o teléfono. Desde el detalle se ven los vehículos registrados.

### Mis Turnos (trabajadores)

Los usuarios con rol **trabajador** solo ven esta pantalla con sus turnos asignados. Pueden cambiar el estado (iniciar, completar).

### Perfil

- Ver datos del usuario
- Cambiar contraseña
- Cerrar sesión

### Personal *(solo admin)*

Gestión del equipo:
- Ver lista de trabajadores activos/inactivos
- Crear nuevo trabajador con email, contraseña y comisión
- Editar datos o desactivar un trabajador

### Servicios *(solo admin)*

Gestión del catálogo de servicios:
- Ver lista con precio y duración
- Crear / editar servicio
- Activar o desactivar un servicio
- Eliminar un servicio

---

## Roles y permisos

| Pantalla | Admin | Trabajador |
|----------|:-----:|:----------:|
| Dashboard | ✅ | ❌ |
| Turnos (todos) | ✅ | ❌ |
| Mis Turnos | ❌ | ✅ |
| Nuevo Turno | ✅ | ❌ |
| Cobrar | ✅ | ❌ |
| Caja | ✅ | ❌ |
| Clientes | ✅ | ❌ |
| Perfil | ✅ | ✅ |
| Personal | ✅ | ❌ |
| Servicios | ✅ | ❌ |

---

## Notificaciones WhatsApp

Al crear un turno, si el cliente tiene teléfono registrado, aparece un botón para abrir WhatsApp con un mensaje pre-armado:

```
📅 Orden agendada
Vehículo: ABC123 — Toyota Corolla
Servicio: Lavado completo
Fecha: martes 15 de abril, 10:30
¡Te esperamos!
```

Los números se normalizan al formato colombiano `57XXXXXXXXXX`.

---

## Solución de problemas frecuentes

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| "Error de conexión" al iniciar | El servidor hangar está caído | Verificar que el backend esté corriendo |
| "Credenciales inválidas" | Email o contraseña incorrectos | Verificar con el admin o hacer seed |
| Lista de clientes vacía al crear turno | Caja cerrada o error de carga | Abrir la caja del día primero; si persiste, hay un botón "Reintentar" |
| Turno no se crea | Caja cerrada | Abrir la caja antes de crear turnos |
| WhatsApp no abre | URL scheme no disponible | Verificar que WhatsApp esté instalado |
| La app muestra datos viejos | Cache del estado | Volver atrás y entrar de nuevo a la pantalla |
