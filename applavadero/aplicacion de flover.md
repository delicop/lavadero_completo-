# Flutter Flavors — Guía de Configuración iOS en Xcode

## Flavors definidos

| Flavor | Bundle ID | Nombre visible | Entry point |
|--------|-----------|----------------|-------------|
| dev | com.lavadero.applavadero.dev | Lavadero DEV | lib/main_dev.dart |
| staging | com.lavadero.applavadero.staging | Lavadero Staging | lib/main_staging.dart |
| prod | com.lavadero.applavadero | Lavadero | lib/main_prod.dart |

---

## PASO 1 — Abrir el proyecto en Xcode

Abrir siempre el workspace, no el `.xcodeproj`:

```
applavadero/ios/Runner.xcworkspace
```

---

## PASO 2 — Duplicar las Build Configurations

En el proyecto Runner (ícono azul) → pestaña **Info** → sección **Configurations** → botón **+**:

| Duplicar esta | Nombre nuevo |
|--------------|--------------|
| Debug | Debug-dev |
| Debug | Debug-staging |
| Release | Release-dev |
| Release | Release-staging |
| Profile | Profile-dev |
| Profile | Profile-staging |

`Debug`, `Release` y `Profile` originales quedan como **prod**.

---

## PASO 3 — Crear archivos xcconfig por flavor

Crear dentro de `ios/Flutter/` (New File → Configuration Settings File):

**`Flutter/Debug-dev.xcconfig`**
```
#include "Generated.xcconfig"
#include "Debug.xcconfig"
FLUTTER_TARGET=lib/main_dev.dart
BUNDLE_ID_SUFFIX=.dev
DISPLAY_NAME=Lavadero DEV
```

**`Flutter/Debug-staging.xcconfig`**
```
#include "Generated.xcconfig"
#include "Debug.xcconfig"
FLUTTER_TARGET=lib/main_staging.dart
BUNDLE_ID_SUFFIX=.staging
DISPLAY_NAME=Lavadero Staging
```

**`Flutter/Release-dev.xcconfig`**
```
#include "Generated.xcconfig"
#include "Release.xcconfig"
FLUTTER_TARGET=lib/main_dev.dart
BUNDLE_ID_SUFFIX=.dev
DISPLAY_NAME=Lavadero DEV
```

**`Flutter/Release-staging.xcconfig`**
```
#include "Generated.xcconfig"
#include "Release.xcconfig"
FLUTTER_TARGET=lib/main_staging.dart
BUNDLE_ID_SUFFIX=.staging
DISPLAY_NAME=Lavadero Staging
```

**`Flutter/Profile-dev.xcconfig`**
```
#include "Generated.xcconfig"
#include "Profile.xcconfig"
FLUTTER_TARGET=lib/main_dev.dart
BUNDLE_ID_SUFFIX=.dev
DISPLAY_NAME=Lavadero DEV
```

**`Flutter/Profile-staging.xcconfig`**
```
#include "Generated.xcconfig"
#include "Profile.xcconfig"
FLUTTER_TARGET=lib/main_staging.dart
BUNDLE_ID_SUFFIX=.staging
DISPLAY_NAME=Lavadero Staging
```

---

## PASO 4 — Asignar xcconfig a cada Build Configuration

Runner (proyecto) → pestaña **Info** → **Configurations** → expandir cada una y asignar al target Runner:

| Configuración | xcconfig |
|---|---|
| Debug-dev | Flutter/Debug-dev |
| Debug-staging | Flutter/Debug-staging |
| Release-dev | Flutter/Release-dev |
| Release-staging | Flutter/Release-staging |
| Profile-dev | Flutter/Profile-dev |
| Profile-staging | Flutter/Profile-staging |

---

## PASO 5 — Configurar Bundle ID por configuración

Target Runner → pestaña **Build Settings** → `Product Bundle Identifier`:

| Configuraciones | Bundle ID |
|---|---|
| Debug / Release / Profile | `com.lavadero.applavadero` |
| Debug-dev / Release-dev / Profile-dev | `com.lavadero.applavadero.dev` |
| Debug-staging / Release-staging / Profile-staging | `com.lavadero.applavadero.staging` |

---

## PASO 6 — Crear los 3 Schemes

**Product → Scheme → Manage Schemes...**

1. Renombrar el scheme `Runner` existente a `prod`
2. Crear scheme `dev` (target: Runner)
3. Crear scheme `staging` (target: Runner)
4. Tildar **Shared** en los tres (para que queden en git)

Asignar Build Configurations a cada scheme:

**Scheme `dev`:**
| Acción | Build Configuration |
|---|---|
| Run | Debug-dev |
| Test | Debug-dev |
| Profile | Profile-dev |
| Analyze | Debug-dev |
| Archive | Release-dev |

**Scheme `staging`:**
| Acción | Build Configuration |
|---|---|
| Run | Debug-staging |
| Test | Debug-staging |
| Profile | Profile-staging |
| Analyze | Debug-staging |
| Archive | Release-staging |

**Scheme `prod`:**
| Acción | Build Configuration |
|---|---|
| Run | Debug |
| Test | Debug |
| Profile | Profile |
| Archive | Release |

---

## PASO 7 — Verificar desde terminal (Mac)

```bash
flutter run --flavor dev -t lib/main_dev.dart
flutter run --flavor staging -t lib/main_staging.dart
flutter run --flavor prod -t lib/main_prod.dart
```

---

## Archivos que quedan en git

```
ios/
├── Flutter/
│   ├── Debug-dev.xcconfig
│   ├── Debug-staging.xcconfig
│   ├── Release-dev.xcconfig
│   ├── Release-staging.xcconfig
│   ├── Profile-dev.xcconfig
│   └── Profile-staging.xcconfig
└── Runner.xcodeproj/
    └── xcshareddata/xcschemes/
        ├── dev.xcscheme
        ├── staging.xcscheme
        └── prod.xcscheme
```

---

## Pendiente (parte Dart + Android)

- Crear `lib/core/config/app_config.dart` — configuración central por flavor
- Crear `lib/main_dev.dart`, `lib/main_staging.dart`, `lib/main_prod.dart`
- Modificar `lib/core/api/api_client.dart` — sacar URL hardcodeada `http://129.80.17.68:3000`
- Configurar `android/app/build.gradle.kts` con `flavorDimensions` y `productFlavors`
