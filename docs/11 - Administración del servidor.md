# 🖥️ Guía de Administración del Servidor — LavaderoApp

## Datos del servidor

| Campo | Valor |
|---|---|
| IP pública | `129.80.17.68` |
| Usuario | `ubuntu` |
| Llave SSH (Windows) | `C:\Users\chris\.ssh\id_rsa` |
| Dominio | `hangarservices918.com` |
| Backend repo | `https://github.com/delicop/lavader-backend` |
| Frontend repo | `https://github.com/delicop/lavadero-frontend` |

---

## 1. Conectarse al servidor por SSH

### Desde Windows (cmd o PowerShell)
```bash
ssh -i C:\Users\chris\.ssh\id_rsa ubuntu@129.80.17.68
```

### Desde Oracle Cloud Shell
```bash
ssh -i ~/.ssh/id_rsa ubuntu@129.80.17.68
```

Para salir del servidor:
```bash
exit
```

---

## 2. Ver estado de los servicios Docker

```bash
cd ~/lavader-backend
docker-compose ps
```

Debe mostrar los dos contenedores en estado **Up**:
- `lavader-backend_backend_1` → NestJS en puerto 3000
- `lavader-backend_postgres_1` → PostgreSQL en puerto 5432

---

## 3. Iniciar los servicios (si están caídos)

```bash
cd ~/lavader-backend
docker-compose up -d
```

---

## 4. Detener los servicios

```bash
cd ~/lavader-backend
docker-compose down
```

---

## 5. Reiniciar los servicios

```bash
cd ~/lavader-backend
docker-compose restart
```

---

## 6. Ver logs del backend (para ver errores)

```bash
cd ~/lavader-backend
docker-compose logs backend
```

Para ver logs en tiempo real:
```bash
docker-compose logs -f backend
```

---

## 7. Actualizar el backend (nuevo código)

```bash
cd ~/lavader-backend
git pull
docker-compose down
docker-compose up -d --build
```

---

## 8. Actualizar el frontend (nuevo código)

### Paso 1 — Conectarse al servidor y actualizar el backend
```bash
ssh -i C:\Users\chris\.ssh\id_rsa ubuntu@129.80.17.68
cd ~/lavadero_completo-
git pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Paso 2 — Build del frontend (en tu PC, PowerShell)
```powershell
cd D:\lavadero\frontangular
npm run build
```

### Paso 3 — Comprimir (en tu PC, PowerShell)
```powershell
cd D:\lavadero\frontangular\dist\frontangular\browser
Compress-Archive -Path * -DestinationPath C:\Users\chris\frontend.zip -Force
```

### Paso 4 — Subir al servidor (en tu PC, PowerShell)
```powershell
scp -i C:\Users\chris\.ssh\id_rsa C:\Users\chris\frontend.zip ubuntu@129.80.17.68:/tmp/
```

### Paso 5 — Deployar (en el servidor por SSH)
```bash
sudo rm -rf /var/www/html/*
sudo unzip /tmp/frontend.zip -d /var/www/html/
sudo systemctl restart nginx
```

> **Tip:** Después de deployar, abrí el navegador con **Ctrl + Shift + R** para limpiar caché.

---

## 9. Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

Ver estado de Nginx:
```bash
sudo systemctl status nginx
```

---

## 10. Si el servidor se reinicia solo (reboot)

Los contenedores Docker se caen con el reboot. Hay que levantarlos manualmente:

```bash
cd ~/lavader-backend
docker-compose up -d
```

> **Tip:** Para que Docker arranque automáticamente al reiniciar el servidor, corre este comando una sola vez:
> ```bash
> sudo systemctl enable docker
> ```
> Y agrega `restart: always` a cada servicio en el `docker-compose.yml`.

---

## 11. Ver uso de recursos del servidor

```bash
htop
```
Presiona `q` para salir.

O más simple:
```bash
free -h    # memoria RAM
df -h      # espacio en disco
```

---

## 12. URLs importantes

| Servicio | URL |
|---|---|
| App completa | http://hangarservices918.com |
| Backend directo | http://129.80.17.68:3000/api |
| Backend (vía Nginx) | http://hangarservices918.com/api |

ssh -i C:\Users\chris\.ssh\id_rsa ubuntu@129.80.17.68

cd ~/lavadero_completo-
git pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build  

El backend está actualizado y el seed corrió bien. Ahora falta actualizar el **frontend** en el servidor — ese es el que todavía muestra la versión vieja.

Hay que hacer estos pasos en tu PC:

**Paso 1 — Build:**
cd D:\lavadero\frontangular
npm run build

**Paso 2 — Comprimir:**

cd D:\lavadero\frontangular\dist\frontangular\browser
Compress-Archive -Path * -DestinationPath C:\Users\chris\frontend.zip -Force

**Paso 3 — Subir:**

scp -i C:\Users\chris\.ssh\id_rsa C:\Users\chris\frontend.zip ubuntu@129.80.17.68:/tmp/

**Paso 4 — Deployar** (en el servidor por SSH):
sudo rm -rf /var/www/html/*
sudo unzip /tmp/frontend.zip -d /var/www/html/
sudo systemctl restart nginx

---

**IMPORTANTE:**

Si después de deployar el frontend la página sigue mostrando la versión vieja, probablemente es por caché del navegador o de Nginx.

**Solución:**

- En el navegador, forzá recarga con **Ctrl+Shift+R** o **Ctrl+F5** (o probá en modo incógnito).
- Si sigue igual, podés limpiar la caché de Nginx agregando este bloque en la config de tu sitio (ejemplo `/etc/nginx/sites-available/default`):
	```nginx
	location / {
			try_files $uri $uri/ /index.html;
			add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
	}
	```
	Luego:
	```bash
	sudo systemctl reload nginx
	```
- Verificá que los archivos en `/var/www/html/` tengan fecha/hora reciente (`ls -l /var/www/html/`).
- Si todo está bien y aún así no ves cambios, probá desde otro dispositivo o red.

> **Tip:** Siempre que deployes el frontend, hacé una recarga forzada del navegador para evitar ver una versión vieja por caché.