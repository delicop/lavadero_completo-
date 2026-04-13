# 📖 Glosario — palabras que vas a ver seguido

Si te encontrás con un término que no entendés, buscalo acá.

---

## Términos de programación

| Término | Explicación simple |
|---------|-------------------|
| **API** | Una "ventanilla" que el frontend usa para pedirle cosas al backend. Ej: "dame los turnos de hoy" |
| **REST** | Una forma de organizar esa ventanilla usando URLs y verbos HTTP (GET, POST, PATCH, DELETE) |
| **HTTP** | El idioma que usan el frontend y el backend para hablar |
| **GET** | Pedir información (leer) |
| **POST** | Enviar información nueva (crear) |
| **PATCH** | Modificar algo que ya existe (actualizar parcialmente) |
| **DELETE** | Borrar algo |
| **JWT** | Una "pulsera de evento" digital. Cuando iniciás sesión, el servidor te da un token. Lo mostrás en cada pedido para demostrar que tenés permiso |
| **Bearer Token** | El formato en que se manda el JWT: `Authorization: Bearer el_token` |
| **WebSocket** | Una conexión que queda abierta entre el navegador y el servidor. Permite que el servidor avise al navegador sin que el navegador pregunte |
| **UUID** | Un identificador único universal. Parece: `a1b2c3d4-e5f6-...`. Se usa como ID de cada registro |
| **DTO** | "Data Transfer Object". Un objeto que define qué datos se esperan en un pedido y los valida |
| **Entity** | Una clase que representa una tabla de la base de datos |
| **Repository** | El objeto que TypeORM da para hacer operaciones con una tabla (buscar, crear, guardar) |
| **TypeORM** | La herramienta que conecta el código con la base de datos. Traduce objetos de TypeScript a SQL |
| **Migration** | Un script que modifica la estructura de la base de datos (crea tablas, agrega columnas) |
| **Docker** | Un sistema que corre programas en "contenedores" aislados. Acá lo usamos para correr PostgreSQL |
| **Hot reload** | Cuando guardás un archivo, el servidor o el navegador se actualizan solos sin reiniciar manualmente |
| **Lazy loading** | Cargar el código solo cuando se necesita, no todo de entrada |
| **Observable** | Un valor que puede cambiar con el tiempo. Angular usa RxJS para esto |
| **Promise** | Una operación asíncrona que va a terminar en algún momento (con éxito o con error) |
| **async/await** | Palabras clave para trabajar con Promises de forma más legible |
| **Interceptor** | Un "inspector" que revisa o modifica todos los pedidos HTTP que pasan por él |
| **Guard** | Un "guardia de seguridad" que decide si una ruta puede abrirse o no |
| **Resolver** | Carga datos antes de mostrar una página |
| **Standalone component** | Un componente de Angular que no necesita pertenecer a un módulo |
| **inject()** | La forma moderna de decirle a Angular "necesito este servicio" |

---

## Términos del negocio

| Término | Qué significa en el sistema |
|---------|----------------------------|
| **Turno** | El registro de un cliente que viene a lavar su auto |
| **Estado del turno** | En qué paso está: pendiente → en proceso → completado (o cancelado) |
| **Caja** | El control de plata del día (cuánto entró, cuánto salió) |
| **Monto inicial** | La plata con la que se arranca el día (lo que ya había en la caja) |
| **Resumen de caja** | El balance del día: ingresos, gastos, ganancias por empleado |
| **Gasto** | Plata que salió del negocio durante el día (materiales, servicios, etc.) |
| **Ingreso manual** | Plata que entró por algo distinto a un lavado (ej: venta de un producto) |
| **Factura** | El recibo que se genera cuando un cliente paga |
| **Liquidación** | El cálculo de cuánto le toca ganar a un empleado en un período |
| **Comisión** | El porcentaje del precio del servicio que se lleva el empleado |
| **Admin** | El rol con acceso total al sistema |
| **Trabajador** | El rol con acceso solo a los turnos propios |
| **Disponible** | Si un trabajador puede recibir nuevos turnos |

---

## Abreviaturas frecuentes en el código

| Abreviatura | Significado |
|-------------|-------------|
| `svc` | service (el servicio inyectado) |
| `repo` | repository (el repositorio de TypeORM) |
| `dto` | data transfer object |
| `cdr` | ChangeDetectorRef (para forzar actualización en Angular) |
| `sub` | subscription (la suscripción a un Observable) |
| `fmt` | formatter (una función de formato) |
| `FK` | Foreign Key (referencia a otra tabla) |
| `UUID` | Universally Unique Identifier |
| `COP` | Pesos colombianos |
| `UTC-5` | Zona horaria de Colombia (Bogotá) |
