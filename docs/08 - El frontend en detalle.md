# 🖥️ El Frontend en detalle

## ¿Qué es Angular?

Angular es el framework que usamos para hacer las pantallas.
Es como un sistema para organizar el código de la interfaz.

Versión: **Angular 21** (la más nueva al momento de escribir esto).

---

## Cómo está organizado

```
frontangular/src/app/
├── core/                  ← servicios y utilidades del sistema
│   ├── guards/            ← controla quién puede entrar a qué ruta
│   ├── interceptors/      ← modifica automáticamente los pedidos HTTP
│   ├── resolvers/         ← carga datos antes de mostrar una página
│   └── services/          ← todos los llamados a la API van acá
├── layout/                ← el "marco" de la app (sidebar + contenido)
├── pages/                 ← una carpeta por página del sistema
├── shared/
│   ├── components/        ← componentes reutilizables (ej: Modal)
│   ├── types/             ← todas las interfaces TypeScript
│   └── utils/             ← funciones auxiliares (formatear precio, fecha, etc.)
├── app.config.ts          ← configuración global (zone, router, http)
├── app.routes.ts          ← mapa de rutas de la app
└── app.ts                 ← componente raíz
```

---

## Cómo fluye la app cuando abrís una página

```
1. Usuario entra a /caja

2. authGuard verifica: ¿tiene token JWT válido?
   → No: redirige a /login
   → Sí: continúa

3. sesionResolver carga los datos del usuario logueado
   (evita que la app renderice antes de saber quién sos)

4. LayoutComponent se monta con el sidebar

5. CajaComponent se carga (lazy loading: solo en ese momento)

6. ngOnInit() del componente hace los llamados a la API

7. La pantalla se actualiza con los datos recibidos
```

---

## Los servicios — cómo se llama a la API

Todos los llamados a la API van en `core/services/`.
Los componentes **nunca** llaman a la API directamente.

Ejemplo de cómo está hecho un servicio:

```typescript
// core/services/caja.service.ts
@Injectable({ providedIn: 'root' })
export class CajaService {
  private readonly http = inject(HttpClient);

  // Convierte el Observable de HttpClient a Promise
  obtenerEstado(): Promise<EstadoCaja> {
    return firstValueFrom(this.http.get<EstadoCaja>('/api/caja/estado'));
  }

  abrir(montoInicial: number, observaciones?: string): Promise<CajaDia> {
    return firstValueFrom(
      this.http.post<CajaDia>('/api/caja/abrir', { montoInicial, observaciones })
    );
  }
}
```

El `authInterceptor` agrega automáticamente el token JWT a cada pedido:
```
Authorization: Bearer eyJhbGci...
```

---

## El tiempo real — WebSockets

El `RealtimeService` mantiene una conexión abierta con el servidor usando **Socket.IO**.

Cuando el servidor emite un evento, el componente que esté escuchando reacciona.

Ejemplo de cómo se usa en un componente:

```typescript
// En ngOnInit:
this.sub = this.realtime.onTurnoActualizado$.subscribe(evento => {
  // actualizar la lista de turnos sin hacer un nuevo fetch
  this.actualizarTurnoEnLista(evento);
});

// En ngOnDestroy (importante: siempre desuscribirse para no tener memory leaks):
this.sub.unsubscribe();
```

---

## Los tipos — interfaces TypeScript

Todos los tipos del negocio están definidos en `shared/types/index.ts`.

Esto garantiza que si la API cambia la estructura de un dato, TypeScript te avisa en todos los lugares donde se usa.

Tipos principales:
- `Usuario` — empleado del lavadero
- `Cliente` — dueño del auto
- `Vehiculo` — el auto
- `Servicio` — tipo de lavado
- `Turno` — el trabajo a realizar
- `Factura` — el recibo de pago
- `CajaDia`, `GastoCaja`, `IngresoManualCaja`, `ResumenCaja` — control de caja
- `Liquidacion` — pago a empleado

---

## Las utilidades — formatters

En `shared/utils/formatters.ts` hay funciones que se reutilizan en toda la app:

| Función | Qué hace | Ejemplo |
|---------|----------|---------|
| `formatPrecio(n)` | Formatea en pesos colombianos | `25000` → `$25.000` |
| `formatFecha(s)` | Formatea fecha legible | `"2026-04-13"` → `"lun. 13 abr."` |
| `fechaLocal()` | Fecha de hoy en Colombia como `YYYY-MM-DD` | `"2026-04-13"` |
| `primerDiaMesLocal()` | Primer día del mes actual | `"2026-04-01"` |

---

## El Modal reutilizable

Hay un componente `ModalComponent` en `shared/components/modal/` que se usa en toda la app para los formularios de crear/editar.

Cómo se usa:

```html
<app-modal [visible]="mostrarModal" titulo="Nuevo cliente" (cerrar)="mostrarModal = false">
  <!-- contenido del formulario acá -->
</app-modal>
```

---

## Lazy loading — por qué las páginas cargan rápido

Cada página se carga solo cuando el usuario la visita, no cuando abre la app.

En `app.routes.ts` se ve así:
```typescript
{
  path: 'caja',
  loadComponent: () =>
    import('./pages/caja/caja.component').then(m => m.CajaComponent),
}
```

La primera vez que entrás a `/caja`, el navegador descarga el código de ese componente.
Si nunca entrás a `/liquidaciones`, ese código nunca se descarga.
Esto hace que la app inicial cargue más rápido.

---

## Standalone components — por qué no hay NgModules

En Angular antiguo, cada componente tenía que declararse en un "módulo".
En Angular moderno (v17+) eso ya no es necesario: cada componente se declara a sí mismo.

Cada componente tiene su propio array `imports: []` con lo que necesita:

```typescript
@Component({
  standalone: true,               // ← esto lo hace standalone
  imports: [
    CommonModule,                 // *ngIf, *ngFor, etc.
    FormsModule,                  // [(ngModel)]
    RouterLink,                   // [routerLink]
    ModalComponent,               // componente propio
  ],
  templateUrl: './caja.component.html',
})
```

Si falta algo en `imports`, Angular te avisa con un error en la consola.
