# 🛠️ Cómo agregar cosas nuevas

Esta guía explica paso a paso cómo agregar una nueva funcionalidad.
Siempre sigue el mismo patrón.

---

## Agregar un nuevo módulo en el backend

Ejemplo: queremos agregar un módulo de "Proveedores".

### Paso 1 — Generar los archivos base

```bash
cd backend
npx nest g module modules/proveedores
npx nest g controller modules/proveedores
npx nest g service modules/proveedores
```

Esto crea automáticamente:
- `proveedores.module.ts`
- `proveedores.controller.ts`
- `proveedores.service.ts`

### Paso 2 — Crear la entidad (la tabla)

Crear `backend/src/modules/proveedores/entities/proveedor.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  telefono: string | null;

  @CreateDateColumn()
  fechaRegistro: Date;
}
```

### Paso 3 — Crear los DTOs (validaciones de entrada)

Crear `backend/src/modules/proveedores/dto/crear-proveedor.dto.ts`:

```typescript
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CrearProveedorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}
```

### Paso 4 — Implementar el servicio (la lógica)

En `proveedores.service.ts` escribís los métodos: `crear`, `buscarTodos`, `buscarPorId`, `actualizar`, etc.

### Paso 5 — Implementar el controlador (los endpoints)

En `proveedores.controller.ts` creás las rutas:
- `@Get()` → lista todos
- `@Post()` → crea uno
- `@Patch(':id')` → actualiza
- `@Delete(':id')` → elimina

### Paso 6 — Registrar en el módulo y en app.module.ts

En `proveedores.module.ts` agregás el `TypeOrmModule.forFeature([Proveedor])`.
En `app.module.ts` importás el `ProveedoresModule`.

---

## Agregar una nueva página en el frontend

Ejemplo: la página de "Gastos" (que está como placeholder).

### Paso 1 — Crear el servicio (si no existe)

```bash
cd frontangular
ng generate service core/services/gastos
```

El servicio va a hacer los llamados a la API. Ejemplo básico:

```typescript
@Injectable({ providedIn: 'root' })
export class GastosService {
  private readonly http = inject(HttpClient);

  listar(): Promise<Gasto[]> {
    return firstValueFrom(this.http.get<Gasto[]>('/api/caja/gastos'));
  }
}
```

### Paso 2 — Agregar los tipos necesarios

En `frontangular/src/app/shared/types/index.ts` agregás las interfaces que necesites.

### Paso 3 — Implementar el componente

Completás el archivo `.component.ts` (ya existe el placeholder) y creás el `.component.html`.

El componente sigue este patrón:

```typescript
@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.component.html',
})
export class GastosComponent implements OnInit {
  private readonly svc = inject(GastosService);

  gastos: Gasto[] = [];
  cargando = true;

  async ngOnInit(): Promise<void> {
    this.gastos = await this.svc.listar();
    this.cargando = false;
  }
}
```

### Paso 4 — Verificar la ruta

Chequeá en `app.routes.ts` que la ruta ya apunte al componente correcto.
Para las páginas placeholder ya está registrada, así que no hace falta tocarla.

### Paso 5 — Verificar el sidebar

Si la página es nueva (no era placeholder), agregarla en `layout.component.ts` en el arreglo `ITEMS_ADMIN` o `ITEMS_OPERACION`.

---

## Convenciones para no romper nada

### Nombres de archivos

| Qué | Ejemplo |
|-----|---------|
| Módulo backend | `proveedores.module.ts` |
| Servicio backend | `proveedores.service.ts` |
| Controlador | `proveedores.controller.ts` |
| Entidad | `proveedor.entity.ts` |
| DTO crear | `crear-proveedor.dto.ts` |
| DTO actualizar | `actualizar-proveedor.dto.ts` |
| Componente Angular | `gastos.component.ts` |
| Servicio Angular | `gastos.service.ts` |

### Reglas que siempre aplican

1. **No repetir lógica** — si ya existe un método que hace lo que necesitás, usalo
2. **No poner lógica en el controlador** — toda la lógica va en el servicio
3. **Siempre validar con DTOs** — nunca recibir datos sin class-validator
4. **async/await en el frontend** — no usar `.subscribe()`, usar `firstValueFrom()`
5. **inject() en Angular** — no usar el constructor para inyectar dependencias
6. **Tipos explícitos** — no usar `any`, definir interfaces en `shared/types/`

---

## Errores comunes y cómo solucionarlos

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot GET /api/algo` | El endpoint no existe o no está registrado | Verificar el controlador y que el módulo esté en app.module.ts |
| `401 Unauthorized` | El token no se está mandando | Verificar que el interceptor esté configurado en app.config.ts |
| `403 Forbidden` | El rol no tiene permiso | Revisar el decorator `@Roles()` en el controlador |
| `404 Not Found` | El registro no existe | El servicio debe tirar `NotFoundException` cuando no encuentra |
| Pantalla no actualiza | Angular no detectó el cambio | Usar `ChangeDetectorRef.detectChanges()` o revisar la lógica async |
| `NullInjectorError` | Falta importar algo en el componente standalone | Agregar el import faltante en el array `imports: []` del componente |
