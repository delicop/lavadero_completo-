# 🚗 Bienvenido al Sistema del Lavadero

## ¿Qué es esto?

Es un **programa de computadora** para manejar un negocio de lavado de autos.

Imaginate que tenés un lavadero de autos. Cada día pasan muchas cosas:
- Llegan clientes con sus autos
- Los empleados lavan los autos
- Al terminar, el cliente paga
- Al final del día, el dueño cuenta cuánta plata entró y cuánta salió

Este sistema hace todo eso **en la computadora**, en lugar de usar papeles y calculadora.

---

## ¿Qué puede hacer el sistema?

| Cosa | Para qué sirve |
|------|----------------|
| **Turnos** | Anotar qué autos llegaron, quién los lava y cómo va el trabajo |
| **Caja** | Controlar la plata del día (lo que entró, lo que se gastó) |
| **Facturación** | Generar recibos cuando un cliente paga |
| **Clientes** | Guardar los datos de cada cliente |
| **Vehículos** | Guardar los autos de cada cliente |
| **Servicios** | Los tipos de lavado que ofrece el negocio (con su precio) |
| **Personal** | Los empleados del lavadero |
| **Liquidaciones** | Calcular cuánto le toca ganar a cada empleado |
| **Asistencia** | Registrar quién vino a trabajar cada día |

---

## ¿Cómo está dividido el programa?

El sistema tiene **3 partes** que trabajan juntas:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   🖥️  PANTALLA (Frontend)                           │
│   Lo que ve el usuario en el navegador              │
│   → Hecho con Angular                               │
│                                                     │
│   ⬆️⬇️ Se hablan por internet (HTTP + WebSockets)    │
│                                                     │
│   ⚙️  CEREBRO (Backend)                             │
│   El que procesa todo y aplica las reglas           │
│   → Hecho con NestJS                                │
│                                                     │
│   ⬆️⬇️ Guarda y lee datos                           │
│                                                     │
│   🗄️  MEMORIA (Base de datos)                       │
│   Donde se guardan todos los datos                  │
│   → PostgreSQL en Docker                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ¿Por dónde empezar a entender?

Lee los archivos en este orden:

1. [[01 - Cómo levantar el proyecto]] — cómo encender el programa
2. [[02 - El negocio]] — cómo funciona un lavadero y qué hace cada rol
3. [[03 - Las páginas]] — qué hace cada pantalla
4. [[04 - El backend]] — cómo funciona el cerebro
5. [[05 - La base de datos]] — cómo se guardan los datos
6. [[06 - Estado actual]] — qué está listo y qué falta
7. [[07 - Cómo agregar cosas]] — guía para seguir desarrollando
