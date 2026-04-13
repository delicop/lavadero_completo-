# 📊 Estado actual del proyecto

> Última actualización: abril 2026

---

## ✅ Qué está terminado y funciona

### Backend (API)
- [x] Login con JWT
- [x] CRUD de usuarios / personal
- [x] CRUD de clientes
- [x] CRUD de vehículos
- [x] CRUD de servicios (con campo `tipoVehiculo`)
- [x] Turnos: crear, listar, cambiar estado, filtrar por fecha/estado/trabajador
- [x] Facturación: crear factura, listar por rango de fechas, buscar por id/turno
- [x] Caja: abrir, cerrar, gastos, ingresos manuales, resumen completo, historial
- [x] Liquidaciones: calcular y marcar como pagada
- [x] WebSockets: eventos en tiempo real para turnos y usuarios
- [x] Zona horaria Colombia (UTC-5) en todos los filtros de fecha

### Frontend (Angular)
- [x] Login
- [x] Dashboard con gestión completa del día (turnos + facturación inline)
- [x] Turnos: lista, crear, cambiar estado, filtros
- [x] Caja: abrir/cerrar, gastos, ingresos manuales, resumen con desglose
- [x] Historial de caja: accordion por día con resumen detallado
- [x] Facturación: listado filtrable, stats por método de pago, imprimir
- [x] Clientes: lista, crear, editar
- [x] Vehículos: lista, crear, editar
- [x] Servicios: lista, crear, editar, activar/desactivar
- [x] Personal: lista, crear, editar empleados
- [x] Liquidaciones: calcular, marcar como pagada
- [x] Asistencia
- [x] Mi Perfil
- [x] Sidebar con grupos colapsables (Operación / Administración)
- [x] Tiempo real: la pantalla se actualiza sin F5 cuando cambian los turnos

---

## 🔲 Qué falta implementar

### Páginas placeholder (solo tienen el archivo `.ts`, sin template)

| Página | Ruta | Qué debería hacer |
|--------|------|-------------------|
| **Gastos** | `/gastos` | Historial y gestión de gastos del negocio |
| **Otros Ingresos** | `/otros-ingresos` | Historial de ingresos manuales |
| **Cotizaciones** | `/cotizaciones` | Generar presupuestos antes de cobrar |

---

## 📁 Archivos no commiteados

Hay ~1400 líneas de cambios sin subir al repositorio. Los cambios más grandes:

| Archivo | Qué cambió |
|---------|-----------|
| `dashboard.component.ts/html` | Gestión completa del día + facturación inline |
| `turnos.component.ts/html` | Refactor completo con filtros y acciones |
| `styles.css` | Nuevas clases de UI |
| `caja.service.ts` (backend) | Resumen optimizado, historial |
| `facturacion.service.ts` (backend) | Integración con caja al crear factura |

---

## 🔧 Deuda técnica conocida

- Los `console.log` de performance en el backend (`[PERF] ...`) son temporales y deberían quitarse antes de producción
- Los `console.log` de debug en `caja.component.ts` (`[CAJA] ngOnInit START`) también son temporales
- Las páginas placeholder (gastos, otros-ingresos, cotizaciones) tienen rutas registradas pero no tienen UI

---

## 📌 Próximos pasos sugeridos

1. Commitear todos los cambios actuales
2. Implementar la página de **Gastos** (historial de gastos de todas las cajas)
3. Implementar la página de **Otros Ingresos** (similar a Gastos)
4. Decidir si **Cotizaciones** va o se saca del sidebar
5. Limpiar los `console.log` de debug del backend y frontend
