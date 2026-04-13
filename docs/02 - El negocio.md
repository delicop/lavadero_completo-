# 🏪 El Negocio — Cómo funciona un lavadero

## La historia del día en el lavadero

Imaginate que sos el dueño. Tu día empieza así:

**1. Abrís la caja**
Ponés la plata con la que arrancás el día (el "monto inicial").
El sistema registra la hora y quién abrió la caja.

**2. Llegan los clientes**
Cada cliente trae su auto. El sistema ya tiene guardado:
- Los datos del cliente (nombre, teléfono)
- Los autos que tiene (marca, modelo, color, placa)

**3. Se crea un turno**
Se anota en el sistema:
- ¿Qué cliente es?
- ¿Qué auto trajo?
- ¿Qué servicio quiere? (ej: lavado básico, lavado completo)
- ¿Qué empleado lo va a atender?

**4. El empleado trabaja**
El turno pasa por estados:
```
pendiente → en_proceso → completado
```
También puede cancelarse: `cancelado`

**5. El cliente paga**
Cuando el turno está `completado`, se genera una **factura**.
El cliente puede pagar con:
- Efectivo
- Transferencia
- Débito
- Crédito

**6. El dinero entra a la caja**
Cada pago se registra automáticamente en la caja del día.

**7. Si hay gastos**
Si el negocio gastó plata en algo (jabón, escobas, etc.), se registra como gasto en la caja.

**8. Al final del día, cerrás la caja**
El sistema calcula:
- Cuánto entró (ventas + otros ingresos)
- Cuánto salió (gastos)
- Cuánto le toca ganar a cada empleado (su % de comisión sobre los servicios que hizo)
- Cuánto queda para el lavadero

---

## Los roles — ¿quién puede hacer qué?

Hay dos tipos de usuarios:

### 👑 Admin (el dueño / administrador)
Puede hacer **todo**:
- Ver y gestionar turnos
- Abrir y cerrar la caja
- Registrar gastos e ingresos
- Ver facturas e historial
- Agregar clientes, vehículos, servicios
- Gestionar el personal
- Ver liquidaciones

### 👷 Trabajador (el que lava)
Solo puede:
- Ver sus propios turnos
- Cambiar el estado de sus turnos (ej: marcar como en proceso, completado)
- Ver clientes y vehículos

---

## Los empleados y las comisiones

Cada empleado tiene un **porcentaje de comisión** (ej: 40%).

Ejemplo:
- Juan lavó 3 autos, cada uno costó $20.000
- Total de servicios de Juan: $60.000
- Comisión de Juan (40%): $24.000
- Lo que queda para el lavadero: $36.000

Las liquidaciones calculan esto por período de tiempo (ej: de lunes a viernes).

---

## Colombia 🇨🇴

El sistema está hecho para Colombia:
- Los precios son en **pesos colombianos (COP)**
- Los teléfonos usan el prefijo **+57**
- Los WhatsApp se guardan como `57XXXXXXXXXX`
- La zona horaria es **UTC-5 (Bogotá)**
