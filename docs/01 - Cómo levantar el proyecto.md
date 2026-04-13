# 🔧 Cómo encender el proyecto

Para que el programa funcione, hay que encender **3 cosas** en orden.
Cada una va en una ventana de terminal separada.

---

## Antes de empezar — requisitos

Necesitás tener instalado en tu computadora:
- **Docker Desktop** — es el que corre la base de datos
- **Node.js** — para correr el backend y el frontend
- Un editor de código (recomendado: VS Code)

---

## Paso 1 — Encender la base de datos

```bash
# Desde la carpeta raíz del proyecto (d:/lavadero)
docker compose up -d
```

> **¿Qué hace esto?**
> Enciende PostgreSQL (donde se guardan los datos) en el puerto 5432.
> También enciende pgAdmin en http://localhost:5050 (una pantalla para ver la base de datos).

> **⚠️ Si no funciona:** Abrí Docker Desktop primero y esperá que el ícono de la ballena deje de moverse.

---

## Paso 2 — Encender el backend (el cerebro)

```bash
cd backend
npm run start:dev
```

> **¿Qué hace esto?**
> Enciende la API en http://localhost:3000/api
> Si modificás un archivo `.ts`, se reinicia solo (hot-reload).

---

## Paso 3 — Encender el frontend (la pantalla)

```bash
cd frontangular
npm start
```

> **¿Qué hace esto?**
> Enciende la pantalla en http://localhost:4200
> Si modificás un archivo, la pantalla se actualiza sola.

---

## Primera vez — crear el usuario admin

Solo hace falta hacerlo **una vez** cuando el proyecto es nuevo:

```bash
cd backend
npm run seed
```

Esto crea el usuario administrador:
- **Email:** admin@lavadero.com
- **Contraseña:** Admin1234

---

## Resumen visual

```
Terminal 1:   docker compose up -d         ← base de datos
Terminal 2:   cd backend && npm run start:dev   ← cerebro (API)
Terminal 3:   cd frontangular && npm start      ← pantalla
```

Después abrís http://localhost:4200 en el navegador y listo.

---

## Si algo no funciona

| Síntoma | Solución |
|---------|----------|
| `docker: command not found` | Instalá Docker Desktop |
| `Cannot connect to database` | Verificá que Docker esté corriendo |
| `Port 3000 already in use` | Hay otro proceso usando ese puerto, cerralo |
| `npm: command not found` | Instalá Node.js |
| La página no carga | Esperá unos segundos, Angular tarda en compilar la primera vez |
