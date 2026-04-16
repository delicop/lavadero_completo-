# Lavadero - Sistema de Gestión de Lavadero

## Documentación del proyecto

Antes de hacer cualquier cosa, leé la carpeta `docs/`. Tiene todo lo que necesitás para entender el proyecto:

| Archivo | Qué explica |
|---------|-------------|
| `docs/00 - Bienvenida.md` | Qué es el sistema y cómo está dividido |
| `docs/01 - Cómo levantar el proyecto.md` | Cómo encender el entorno de desarrollo |
| `docs/02 - El negocio.md` | Cómo funciona el negocio y los roles |
| `docs/03 - Las páginas.md` | Qué hace cada pantalla del frontend |
| `docs/04 - El backend.md` | Cada módulo de NestJS explicado |
| `docs/05 - La base de datos.md` | Tablas, columnas y relaciones |
| `docs/06 - Estado actual.md` | Qué está listo, qué falta, qué hay pendiente |
| `docs/07 - Cómo agregar cosas.md` | Guía para agregar módulos y páginas nuevas |
| `docs/08 - El frontend en detalle.md` | Angular: servicios, lazy loading, WebSockets, types |
| `docs/09 - Glosario.md` | Términos técnicos y del negocio explicados |
| `docs/10 - Bugs encontrados y resueltos.md` | Bugs detectados en revisión de código, fix aplicado y descartados |

---

## Contexto del Proyecto

Sistema de gestión para un lavadero de vehículos. **El objetivo final es convertirlo en un SaaS** para venderlo a múltiples lavaderos como servicio por suscripción.

Estado actual: producto funcional para un solo lavadero (single-tenant).
Próximo paso estructural: implementar **multi-tenancy** — ver `docs/06 - Estado actual.md` para el roadmap completo.

Incluye registro de clientes, vehículos, servicios, turnos y facturación.

**Stack:**
- Backend: NestJS (TypeScript)
- Frontend: Angular 21 (standalone components, zoneful, lazy loading)
- Base de datos: PostgreSQL (Docker)

**Módulos implementados:** auth, usuarios, clientes, vehículos, servicios, turnos, facturación, liquidaciones, caja, personal
**Módulos en construcción (frontend placeholder):** gastos, otros-ingresos, cotizaciones

**País:** Colombia — código de teléfono `+57`. Los números de WhatsApp se normalizan a `57XXXXXXXXXX`.

**Objetivo pedagógico:** El desarrollador está reforzando conocimientos en
TypeScript, NestJS y Angular. Priorizar claridad del código y buenas prácticas
sobre optimización prematura.

---

## Cómo levantar el proyecto

### 1. Base de datos (Docker)

```bash
# Desde la raíz del proyecto
docker compose up -d
```

Levanta PostgreSQL en `localhost:5432` y pgAdmin en `http://localhost:5050`.
Si Docker Desktop no está corriendo, abrirlo primero y esperar que inicie.

### 2. Backend (NestJS — API)

```bash
cd backend
npm run start:dev
```

Queda escuchando en `http://localhost:3000/api`
Hot-reload activado: guarda un archivo y reinicia solo.

### 3. Frontend (Angular)

```bash
cd frontangular
npm start
```

Queda en `http://localhost:4200`
Hot-reload activado (Angular CLI dev server).

### Levantar todo junto (en terminales separadas)

```
Terminal 1 → docker compose up -d              (solo la primera vez o si está apagado)
Terminal 2 → cd backend && npm run start:dev
Terminal 3 → cd frontangular && npm start
```

### Primer uso — crear el usuario admin

```bash
cd backend
npm run seed
```

Crea: `admin@lavadero.com` / `Admin1234`

---

## Estructura del Repositorio

```
lavadero/
├── backend/          # API REST con NestJS
├── frontangular/     # UI con Angular 21
└── CLAUDE.md
```

---

## Navegación del Frontend — Estructura del Sidebar

El sidebar está dividido en dos niveles:

**Links directos (todos los roles):**
- Panel (`/dashboard`)

**Grupo colapsable — Operación (solo admin):**
- Turnos (`/turnos`) — turnos del día; por defecto filtra solo hoy
- Caja (`/caja`)
- Gastos (`/gastos`) — 🔲 en construcción
- Otros Ingresos (`/otros-ingresos`) — 🔲 en construcción
- Cotizaciones (`/cotizaciones`) — 🔲 en construcción
- Liquidaciones (`/liquidaciones`)
- Asistencia (`/asistencia`)

**Grupo colapsable — Administración (solo admin):**
- Clientes (`/clientes`)
- Vehículos (`/vehiculos`)
- Servicios (`/servicios`)
- Personal (`/configuracion`) — gestión de todo el personal del negocio (dueño, admin, colaboradores)
- Mi perfil (`/mi-perfil`)

Ambos grupos se auto-abren si la ruta activa pertenece a ese grupo.
La lógica del sidebar está en `frontangular/src/app/layout/layout.component.ts`.

---

## Backend — NestJS

### Estructura de carpetas

```
backend/
├── src/
│   ├── modules/              # Módulos por dominio
│   │   ├── auth/             # Login, JWT, guards de autenticación
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       └── login.dto.ts
│   │   ├── usuarios/         # CRUD de todo el personal (admin, colaboradores, etc.)
│   │   │   ├── usuarios.module.ts
│   │   │   ├── usuarios.controller.ts
│   │   │   ├── usuarios.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── crear-usuario.dto.ts
│   │   │   │   └── actualizar-usuario.dto.ts
│   │   │   └── entities/
│   │   │       └── usuario.entity.ts
│   │   ├── clientes/
│   │   │   ├── clientes.module.ts
│   │   │   ├── clientes.controller.ts
│   │   │   ├── clientes.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── crear-cliente.dto.ts
│   │   │   │   └── actualizar-cliente.dto.ts
│   │   │   └── entities/
│   │   │       └── cliente.entity.ts
│   │   ├── vehiculos/
│   │   ├── servicios/
│   │   ├── turnos/
│   │   ├── events/           # WebSocket gateway (tiempo real)
│   │   ├── facturacion/
│   │   ├── liquidaciones/
│   │   └── caja/             # Control de caja diaria (apertura, cierre, gastos, ingresos)
│   │   │   ├── caja.module.ts
│   │   │   ├── caja.controller.ts
│   │   │   ├── caja.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── abrir-caja.dto.ts
│   │   │   │   ├── registrar-gasto.dto.ts
│   │   │   │   └── registrar-ingreso-manual.dto.ts
│   │   │   └── entities/
│   │   │       ├── caja-dia.entity.ts
│   │   │       ├── gasto-caja.entity.ts
│   │   │       └── ingreso-manual-caja.entity.ts
│   ├── common/               # Compartido entre módulos
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── decorators/
│   │   ├── filters/
│   │   └── pipes/
│   ├── config/               # Variables de entorno y configuración
│   ├── database/             # Configuración de base de datos y migraciones
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env
├── .env.example
├── nest-cli.json
├── package.json
└── tsconfig.json
```

### Convenciones de nombres

| Tipo         | Sufijo            | Ejemplo                        |
|--------------|-------------------|--------------------------------|
| Módulo       | `.module.ts`      | `clientes.module.ts`           |
| Controlador  | `.controller.ts`  | `clientes.controller.ts`       |
| Servicio     | `.service.ts`     | `clientes.service.ts`          |
| DTO crear    | `crear-*.dto.ts`  | `crear-cliente.dto.ts`         |
| DTO actualiz | `actualizar-*.dto.ts` | `actualizar-cliente.dto.ts`|
| Entidad      | `.entity.ts`      | `cliente.entity.ts`            |
| Guard        | `.guard.ts`       | `jwt-auth.guard.ts`            |
| Interceptor  | `.interceptor.ts` | `logging.interceptor.ts`       |
| Filtro       | `.filter.ts`      | `http-exception.filter.ts`     |
| Pipe         | `.pipe.ts`        | `validacion.pipe.ts`           |

### Reglas del backend

1. **Un módulo por dominio**: cada entidad del negocio tiene su propio módulo
   (clientes, vehículos, servicios, turnos, facturación).
2. **DTOs con validación**: usar siempre `class-validator` y `class-transformer`
   en los DTOs. Nunca recibir datos sin validar.
3. **ValidationPipe global**: configurar en `main.ts` con `whitelist: true` y
   `forbidNonWhitelisted: true`.
4. **Servicios para la lógica**: los controladores solo reciben la petición y
   delegan al servicio. Nunca poner lógica de negocio en el controlador.
5. **Inyección de dependencias**: siempre usar el sistema de DI de NestJS,
   nunca instanciar servicios con `new`.
6. **Variables de entorno**: usar `@nestjs/config` con un archivo `.env`.
   Nunca hardcodear credenciales en el código.
7. **Manejo de errores**: usar excepciones de NestJS (`NotFoundException`,
   `BadRequestException`, etc.). Agregar un filtro global para errores no
   controlados.
8. **Respuestas consistentes**: todas las respuestas siguen la misma estructura
   `{ data, message, statusCode }`.
9. **Autenticación con JWT**: usar `@nestjs/jwt` y `passport-jwt`. El token
   incluye `{ sub: userId, rol }`. Proteger rutas con `JwtAuthGuard`.
10. **Autorización por roles**: usar un decorator `@Roles('admin')` junto a un
    `RolesGuard` que lee el rol del token. Los trabajadores solo acceden a sus
    rutas permitidas.

### Comandos frecuentes del backend

```bash
cd backend
npm run start:dev          # Desarrollo con hot-reload
npm run build              # Compilar
npm run test               # Tests unitarios
npm run test:e2e           # Tests end-to-end
npx nest g module <nombre> # Generar módulo
npx nest g controller <nombre>
npx nest g service <nombre>
```

---

## Frontend — Angular 21

### Características clave

- **Standalone components**: sin NgModules, cada componente declara sus propios imports
- **Zoneful**: usa `zone.js` (importado en `main.ts`) + `provideZoneChangeDetection()`
- **Lazy loading**: todas las páginas se cargan bajo demanda via `loadComponent`
- **HttpClient**: configurado con interceptor funcional (`authInterceptor`) que adjunta el JWT
- **WebSockets**: `RealtimeService` wrappea `socket.io-client`; emite `onTurnoActualizado$` y `onUsuarioActualizado$`
- **Route Resolver**: `sesionResolver` pre-carga la sesión antes de renderizar hijos (evita race condition)

### Estructura de carpetas

```
frontangular/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/           # authGuard (CanActivateFn)
│   │   │   ├── interceptors/     # authInterceptor (HttpInterceptorFn)
│   │   │   ├── resolvers/        # sesionResolver (ResolveFn)
│   │   │   └── services/         # AuthService, SesionService, RealtimeService, etc.
│   │   ├── layout/               # LayoutComponent (sidebar + router-outlet)
│   │   ├── pages/                # Una carpeta por página
│   │   │   ├── dashboard/
│   │   │   ├── turnos/
│   │   │   ├── clientes/
│   │   │   ├── vehiculos/
│   │   │   ├── servicios/
│   │   │   ├── caja/
│   │   │   ├── liquidaciones/
│   │   │   ├── asistencia/
│   │   │   ├── configuracion/    # Personal del negocio (ruta: /configuracion, label: "Personal")
│   │   │   ├── mi-perfil/
│   │   │   └── login/
│   │   ├── shared/
│   │   │   ├── components/       # ModalComponent y otros reutilizables
│   │   │   ├── types/            # Interfaces TypeScript del dominio
│   │   │   └── utils/            # formatters, whatsapp helpers
│   │   ├── app.config.ts         # providers: zone, router, httpClient+interceptor
│   │   ├── app.routes.ts         # rutas lazy con sesionResolver y authGuard
│   │   └── app.ts                # componente raíz con <router-outlet>
│   ├── main.ts                   # import 'zone.js' PRIMERO, luego bootstrapApplication
│   └── styles.css                # CSS global con variables y diseño minimalista
├── angular.json
├── package.json
└── tsconfig.json
```

### Convenciones de nombres (Angular)

- Componentes: `kebab-case` en carpeta, `PascalCase` en clase → `dashboard.component.ts`
- Servicios: `kebab-case` con sufijo `.service.ts` → `turno.service.ts`
- Guards: sufijo `.guard.ts` → `auth.guard.ts`
- Interceptors: sufijo `.interceptor.ts` → `auth.interceptor.ts`
- Resolvers: sufijo `.resolver.ts` → `sesion.resolver.ts`
- Tipos: `PascalCase` en `shared/types/` → `types/index.ts`

### Reglas del frontend Angular

1. **Standalone components**: todos los componentes son standalone. Declarar imports explícitamente (`CommonModule`, `FormsModule`, `RouterLink`, etc.).
2. **`inject()` en lugar de constructor**: usar `inject()` para inyección de dependencias.
3. **Servicios para la API**: todos los `HttpClient` calls van en `core/services/`. Los componentes nunca llaman a la API directamente.
4. **Tipos explícitos**: definir interfaces en `shared/types/`. No usar `any`.
5. **Async/await**: usar siempre `async/await`. Los métodos de servicio retornan `Promise<T>` con `firstValueFrom(this.http.get(...))`.
6. **Modales**: usar `ModalComponent` con `[visible]`, `[titulo]`, `(cerrar)` para formularios de creación/edición.
7. **Tiempo real**: suscribirse a `RealtimeService.onTurnoActualizado$` y `onUsuarioActualizado$` en los componentes que necesiten actualizarse sin F5. Desuscribir en `ngOnDestroy`.

### Comandos frecuentes del frontend

```bash
cd frontangular
npm start                          # Desarrollo (http://localhost:4200)
npm run build                      # Build de producción
ng generate component pages/<nombre>/<nombre>  # Nuevo componente
ng generate service core/services/<nombre>     # Nuevo servicio
```

---

## Dominio del Negocio — Entidades Principales

```
Usuario (Personal del negocio)
  - id, nombre, apellido, email, passwordHash, rol (admin/trabajador), activo,
    comisionPorcentaje, fechaRegistro
  Roles actuales:
    · admin       → acceso total: personal, clientes, vehículos, servicios, reportes, caja
    · trabajador  → acceso operativo: ver/gestionar turnos asignados, registrar avance
  Nota: el sistema de roles está pensado para expandirse (ej. vendedor, lavador)
        sin cambiar la estructura base. Se gestiona desde la página Personal (/configuracion).

Cliente
  - id, nombre, apellido, telefono, email, fechaRegistro

Vehiculo
  - id, clienteId, patente, marca, modelo, color, tipo (auto/moto/camioneta)

Servicio
  - id, nombre, descripcion, duracionMinutos, precio

Turno
  - id, clienteId, vehiculoId, servicioId, trabajadorId, fechaHora,
    estado (pendiente/en_proceso/completado/cancelado), observaciones

Factura
  - id, turnoId, total, fechaEmision, metodoPago
```

### Permisos por rol

| Recurso                     | admin | trabajador |
|-----------------------------|:-----:|:----------:|
| Gestionar personal          |  ✓    |     ✗      |
| Gestionar servicios/precios |  ✓    |     ✗      |
| Ver reportes / facturación  |  ✓    |     ✗      |
| Ver y gestionar turnos      |  ✓    |     ✓      |
| Registrar avance de turno   |  ✓    |     ✓      |
| Ver clientes y vehículos    |  ✓    |     ✓      |

---

## Guía de Desarrollo

### Al crear un nuevo módulo en el backend:
1. `npx nest g module modules/<nombre>`
2. `npx nest g controller modules/<nombre>`
3. `npx nest g service modules/<nombre>`
4. Crear carpetas `dto/` y `entities/` dentro del módulo
5. Crear DTOs con validaciones
6. Implementar CRUD en el servicio
7. Exponer endpoints en el controlador

### Al crear un nuevo componente en Angular:
1. Crear carpeta en `src/app/pages/<nombre>/`
2. Crear `<nombre>.component.ts` (standalone) y `<nombre>.component.html`
3. Agregar tipos necesarios en `src/app/shared/types/`
4. Crear o reutilizar servicio en `src/app/core/services/`
5. Registrar la ruta con `loadComponent` en `app.routes.ts`

---

## Reglas generales de desarrollo

1. **Reutilizar sobre crear**: antes de escribir una función nueva, buscar si ya existe una que haga lo mismo o algo similar. Ejemplos concretos:
   - TypeORM tiene `.increment({ id }, 'campo', valor)` y `.decrement()` — usarlos en vez de hacer un `UPDATE` manual o un find+save.
   - Si un servicio ya expone un método que necesitás, inyectá el servicio en lugar de duplicar la lógica.
2. **Reescribir, no acumular**: cuando se modifica un comportamiento existente, reemplazar el código anterior. No agregar código encima de código viejo.

---

## Referencias

- [NestJS Docs](https://docs.nestjs.com/)
- [Angular Docs](https://angular.dev/)
- [class-validator](https://github.com/typestack/class-validator)
