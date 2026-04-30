# Memorias del Proyecto — applavadero

Registro de decisiones, ideas evaluadas y funcionalidades tocadas o planeadas.
El objetivo es tener contexto de cómo fue evolucionando la app.

---

## Flutter Flavors

**Estado:** En proceso de configuración
**Fecha:** 2026-04-28

Decidimos implementar flavors para separar ambientes desde el inicio, pensando en el crecimiento del SaaS.

Flavors definidos:
- `dev` → desarrollo local, API local
- `staging` → pruebas, API de staging
- `prod` → producción, API Oracle Cloud (`http://129.80.17.68:3000`)

Pendiente:
- [ ] Configurar Xcode (guía guardada en `aplicacion de flover.md`) — requiere Mac
- [ ] Crear `lib/core/config/app_config.dart`
- [ ] Crear entry points `main_dev.dart`, `main_staging.dart`, `main_prod.dart`
- [ ] Sacar URL hardcodeada de `lib/core/api/api_client.dart`
- [ ] Configurar `android/app/build.gradle.kts` con productFlavors

---

## Reconocimiento de Placas (Plate Recognizer)

**Estado:** Evaluado, no implementado
**Fecha:** 2026-04-28

Se evaluó integrar la API de Plate Recognizer Snapshot para que al crear un turno el usuario pueda fotografiar la placa del vehículo en lugar de buscar el cliente manualmente.

Flujo planteado:
1. Usuario toca "Escanear placa" en el paso 1 de nuevo turno
2. `image_picker` abre la cámara
3. `PlateRecognizerService` manda la foto a la API y devuelve la placa
4. Se busca en el backend con `GET /vehiculos/buscar?placa=`
5. Si existe → autocompleta cliente y vehículo
6. Si no existe → abre formulario con la placa pre-cargada

Viabilidad:
- Free tier: 2.500 llamadas/mes — alcanza para un lavadero (~900/mes)
- Colombia está soportado por la API
- Costo escala: a partir de ~15.000 llamadas/mes sale del free tier (~$49 USD/mes)
- Requiere internet — sin conexión no funciona, siempre necesita fallback manual
- Encaja bien con flavors: cada ambiente usaría su propia API key

Decisión: posponer hasta tener feedback real de usuarios sobre si la búsqueda manual es un dolor.

Paquete necesario cuando se implemente: `image_picker: ^1.1.0`
Cambio en backend: endpoint `GET /vehiculos/buscar?placa=` en el módulo vehiculos

---
