# Tenants — módulo de multi-tenancy

**Ver también:** [[_indice]] | [[../04 - El backend]] | [[../05 - La base de datos]] | [[../06 - Estado actual]]
**Usado por:** todos los módulos del sistema

**Archivos:**
- `backend/src/modules/tenants/entities/tenant.entity.ts`
- `backend/src/modules/tenants/tenants.service.ts`
- `backend/src/modules/tenants/tenants.module.ts`

Un **tenant** representa un lavadero registrado en el sistema. Cada tenant tiene sus propios datos completamente aislados de los demás.

---

## ¿Cómo funciona el aislamiento?

```
Login
  └── JWT generado: { sub: userId, rol, tenantId }
         │
         ▼
  Cada request lleva el JWT en el header Authorization
         │
         ▼
  JwtStrategy.validate() → retorna el Usuario (con tenantId)
         │
         ▼
  @UsuarioActual() en el controller → extrae usuario.tenantId
         │
         ▼
  service.metodo(datos, tenantId)
         │
         ▼
  repo.find({ where: { ..., tenantId } })  ← aislamiento real
```

Ningún query de datos puede ejecutarse sin `tenantId`. Si un usuario intentara acceder a datos de otro tenant, el `WHERE tenantId = ?` lo impediría.

---

## Entidad

```typescript
@Entity('tenants')
export class Tenant {
  id: string          // UUID
  nombre: string      // "Lavadero El Rápido"
  slug: string        // "el-rapido" — único globalmente
  activo: boolean     // si puede usar el sistema
  fechaCreacion: Date
}
```

---

## Service — métodos

### `crear(nombre, slug)` — crear un nuevo tenant
Verifica que el `slug` no esté en uso → `ConflictException`.
Crea y guarda el tenant.

---

### `buscarPorId(id)` — buscar por ID
Si no existe: `NotFoundException`.

---

### `buscarPorSlug(slug)` — buscar por slug
Devuelve `null` si no existe. Útil para el onboarding y login multi-tenant.

---

### `buscarTodos()` — listar todos los tenants
Ordena por `fechaCreacion DESC`. Útil para el futuro superadmin del SaaS.

---

## Convención en todos los módulos

Cada servicio del sistema sigue este patrón:

```typescript
// Controller — extrae tenantId del usuario autenticado
@Get()
buscarTodos(@UsuarioActual() usuario: Usuario) {
  return this.miServicio.buscarTodos(usuario.tenantId!);
}

// Service — aplica tenantId en el WHERE
async buscarTodos(tenantId: string): Promise<MiEntidad[]> {
  return this.repo.find({ where: { tenantId } });
}
```

---

## Estado actual

- [x] Tabla `tenants` creada
- [x] `tenantId` en todas las entidades (nullable para compatibilidad con `synchronize`)
- [x] JWT incluye `tenantId`
- [x] Todos los servicios filtran por `tenantId`
- [x] Seed crea el tenant `Demo Lavadero` (slug: `demo`)
- [ ] Endpoint de registro/onboarding para nuevos lavaderos
- [ ] Login multi-tenant (hoy el email de usuario es globalmente único)
