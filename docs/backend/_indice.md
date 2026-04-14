# Índice — Documentación Backend

Cada archivo documenta un módulo NestJS: sus endpoints (método, ruta, guards), las dependencias del servicio y cada método con su lógica detallada.

Ver también: [[frontend/_indice]] | [[../04 - El backend]] | [[../05 - La base de datos]] | [[../00 - Bienvenida]]

| Módulo | Prefijo API | Archivo |
|--------|-------------|---------|
| [[auth]] | `/api/auth` | Login, cambio de contraseña, disponibilidad |
| [[tenants]] | *(interno)* | Gestión de tenants (multi-tenancy) |
| [[usuarios]] | `/api/usuarios` | CRUD de empleados |
| [[clientes]] | `/api/clientes` | CRUD de clientes |
| [[turnos]] | `/api/turnos` | Turnos: crear, listar, cambiar estado |
| [[facturacion]] | `/api/facturacion` | Generar y consultar facturas |
| [[caja]] | `/api/caja` | Caja diaria, gastos, ingresos, resumen |
