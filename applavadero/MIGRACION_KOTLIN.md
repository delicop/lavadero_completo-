# Migración: Flutter → Android Nativo (Kotlin + Jetpack Compose)
## App Lavadero

---

## 1. Equivalencias de Stack

| Flutter | Android Kotlin | Notas |
|---|---|---|
| `dio` | **Retrofit + OkHttp** | Interceptores JWT igual de limpios |
| `socket_io_client` | **socket.io-client-java** | Misma librería, mismos eventos |
| `flutter_secure_storage` | **EncryptedSharedPreferences** | JWT encriptado con Android Keystore |
| `go_router` | **Navigation Compose** | Navegación declarativa, deep links |
| `provider` (ChangeNotifier) | **ViewModel + StateFlow** | Patrón MVVM, más robusto |
| `intl` (NumberFormat) | **NumberFormat (java.text)** | Formato COP nativo |
| Material Design 3 | **Material3 (Compose)** | Idéntico, mismo sistema de diseño |
| `StatelessWidget` | **@Composable fun** | Función composable |
| `StatefulWidget` | **ViewModel + collectAsState()** | Estado externo al UI |
| `BuildContext` | No existe | Compose no lo necesita |
| `setState()` | **StateFlow.value = ...** | El UI se actualiza solo |

---

## 2. Estructura del Proyecto (Kotlin)

```
app/
└── src/main/
    ├── java/com/lavadero/app/
    │   ├── core/
    │   │   ├── network/
    │   │   │   ├── ApiClient.kt          ← Retrofit + OkHttp con interceptor JWT
    │   │   │   ├── ApiService.kt         ← Endpoints
    │   │   │   └── AuthInterceptor.kt    ← Adjunta Bearer token a cada request
    │   │   ├── auth/
    │   │   │   ├── TokenStorage.kt       ← EncryptedSharedPreferences (JWT)
    │   │   │   └── AuthViewModel.kt      ← Estado de autenticación global
    │   │   ├── services/
    │   │   │   ├── TurnoService.kt
    │   │   │   ├── ClienteService.kt
    │   │   │   ├── VehiculoService.kt
    │   │   │   ├── ServicioService.kt
    │   │   │   ├── CajaService.kt
    │   │   │   └── RealtimeService.kt    ← Socket.IO
    │   │   └── models/
    │   │       ├── Usuario.kt
    │   │       ├── Cliente.kt
    │   │       ├── Vehiculo.kt
    │   │       ├── Servicio.kt
    │   │       ├── Turno.kt
    │   │       ├── Factura.kt
    │   │       └── Caja.kt
    │   ├── features/
    │   │   ├── login/
    │   │   │   ├── LoginScreen.kt
    │   │   │   └── LoginViewModel.kt
    │   │   ├── dashboard/
    │   │   │   ├── DashboardScreen.kt
    │   │   │   ├── MisTurnosScreen.kt
    │   │   │   └── DashboardViewModel.kt
    │   │   ├── turnos/
    │   │   │   ├── TurnosScreen.kt
    │   │   │   ├── DetalleTurnoScreen.kt
    │   │   │   ├── NuevoTurnoScreen.kt
    │   │   │   ├── CobrarScreen.kt
    │   │   │   └── TurnosViewModel.kt
    │   │   ├── caja/
    │   │   │   ├── CajaScreen.kt
    │   │   │   └── CajaViewModel.kt
    │   │   ├── clientes/
    │   │   │   ├── ClientesScreen.kt
    │   │   │   ├── ClienteDetalleScreen.kt
    │   │   │   └── ClientesViewModel.kt
    │   │   └── perfil/
    │   │       ├── PerfilScreen.kt
    │   │       └── PerfilViewModel.kt
    │   ├── shared/
    │   │   ├── components/
    │   │   │   ├── EstadoChip.kt
    │   │   │   ├── CardTurno.kt
    │   │   │   ├── InputField.kt
    │   │   │   ├── BotonPrimario.kt
    │   │   │   ├── LoadingOverlay.kt
    │   │   │   └── EmptyState.kt
    │   │   ├── theme/
    │   │   │   ├── Color.kt
    │   │   │   └── Theme.kt
    │   │   └── utils/
    │   │       └── Formatters.kt
    │   ├── navigation/
    │   │   └── AppNavigation.kt
    │   └── MainActivity.kt
    └── res/
```

---

## 3. Dependencias (build.gradle)

```kotlin
dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("io.socket:socket.io-client:2.1.0") {
        exclude(group = "org.json", module = "json")
    }
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-android-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

---

## 4. Código clave traducido

### TokenStorage

**Flutter:**
```dart
class TokenStorage {
  final _storage = const FlutterSecureStorage();
  Future<void> save(String token) => _storage.write(key: 'jwt_token', value: token);
  Future<String?> read() => _storage.read(key: 'jwt_token');
  Future<void> delete() => _storage.delete(key: 'jwt_token');
}
```

**Kotlin:**
```kotlin
class TokenStorage(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build()
    private val prefs = EncryptedSharedPreferences.create(
        context, "secure_prefs", masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    fun save(token: String) = prefs.edit().putString("jwt_token", token).apply()
    fun read(): String? = prefs.getString("jwt_token", null)
    fun delete() = prefs.edit().remove("jwt_token").apply()
}
```

### AuthInterceptor

**Kotlin:**
```kotlin
class AuthInterceptor(private val tokenStorage: TokenStorage) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenStorage.read()
        val request = chain.request().newBuilder()
            .apply { if (token != null) addHeader("Authorization", "Bearer $token") }
            .build()
        return chain.proceed(request)
    }
}
```

### RealtimeService (Socket.IO)

**Flutter:**
```dart
class RealtimeService {
  late IO.Socket socket;
  void conectar(String baseUrl) {
    socket = IO.io(baseUrl, OptionBuilder().setTransports(['websocket']).build());
    socket.connect();
  }
}
```

**Kotlin:**
```kotlin
class RealtimeService {
    private lateinit var socket: Socket
    fun conectar(baseUrl: String) {
        val opts = IO.Options.builder().setTransports(arrayOf(WebSocket.NAME)).build()
        socket = IO.socket(baseUrl, opts)
        socket.connect()
    }
    fun onTurnoActualizado(callback: (JSONObject) -> Unit) {
        socket.on("turno_actualizado") { args -> callback(args[0] as JSONObject) }
    }
    fun desconectar() = socket.disconnect()
}
```

### ViewModel (equivale a Provider/ChangeNotifier)

**Flutter:**
```dart
class LoginProvider extends ChangeNotifier {
  bool _loading = false;
  Future<void> login(String email, String password) async {
    _loading = true; notifyListeners();
    // ...
    _loading = false; notifyListeners();
  }
}
```

**Kotlin:**
```kotlin
@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authService: AuthService,
    private val tokenStorage: TokenStorage
) : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, error = null) }
            try {
                val token = authService.login(email, password)
                tokenStorage.save(token)
                _uiState.update { it.copy(loading = false, success = true) }
            } catch (e: Exception) {
                _uiState.update { it.copy(loading = false, error = e.message) }
            }
        }
    }
}

data class LoginUiState(
    val loading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false
)
```

### Navegación (equivale a go_router)

**Kotlin:**
```kotlin
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = "login") {
        composable("login") {
            LoginScreen(onLoginSuccess = { rol ->
                val dest = if (rol == "admin") "dashboard" else "mis-turnos"
                navController.navigate(dest) { popUpTo("login") { inclusive = true } }
            })
        }
        composable("dashboard") { DashboardScreen(navController) }
        composable("mis-turnos") { MisTurnosScreen(navController) }
        composable("turnos") { TurnosScreen(navController) }
        composable("turnos/nuevo") { NuevoTurnoScreen(navController) }
        composable("turnos/{id}") { DetalleTurnoScreen(navController, it.arguments?.getString("id") ?: "") }
        composable("turnos/{id}/cobrar") { CobrarScreen(navController, it.arguments?.getString("id") ?: "") }
        composable("caja") { CajaScreen(navController) }
        composable("clientes") { ClientesScreen(navController) }
        composable("clientes/{id}") { ClienteDetalleScreen(navController, it.arguments?.getString("id") ?: "") }
        composable("perfil") { PerfilScreen(navController) }
    }
}
```

### Colores y Tema

```kotlin
// Color.kt
val ColorPrimario   = Color(0xFF1E88E5)
val ColorFondo      = Color(0xFF121212)
val ColorSuperficie = Color(0xFF1E1E1E)
val ColorTexto      = Color(0xFFFFFFFF)
val ColorSubtexto   = Color(0xFFB0B0B0)
val ColorPendiente  = Color(0xFFFF9800)
val ColorEnProceso  = Color(0xFF2196F3)
val ColorCompletado = Color(0xFF4CAF50)
val ColorCancelado  = Color(0xFFEF5350)

// Theme.kt
@Composable
fun LavaderoTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = ColorPrimario,
            background = ColorFondo,
            surface = ColorSuperficie,
            onPrimary = Color.White,
            onBackground = ColorTexto,
            onSurface = ColorTexto,
        ),
        content = content
    )
}
```

### Formatters

```kotlin
fun formatearPesos(monto: Number): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("es", "CO"))
    formatter.maximumFractionDigits = 0
    return formatter.format(monto) // "$25.000"
}

fun formatearFecha(isoDate: String): String {
    val fecha = LocalDateTime.parse(isoDate, DateTimeFormatter.ISO_DATE_TIME)
    return fecha.format(DateTimeFormatter.ofPattern("EEEE d 'de' MMMM", Locale("es", "CO")))
}

fun formatearHora(isoDate: String): String {
    val fecha = LocalDateTime.parse(isoDate, DateTimeFormatter.ISO_DATE_TIME)
    return fecha.format(DateTimeFormatter.ofPattern("HH:mm"))
}
```

---

## 5. Conceptos clave: Flutter vs Kotlin/Compose

| Concepto | Flutter | Kotlin Compose |
|---|---|---|
| UI reactivo | `setState()` / `notifyListeners()` | `StateFlow` → `collectAsState()` |
| Async | `async/await` | `suspend` + `viewModelScope.launch {}` |
| Lista | `ListView.builder` | `LazyColumn` |
| Navegación con args | `context.push('/turnos/$id')` | `navController.navigate("turnos/$id")` |
| Snackbar | `ScaffoldMessenger.showSnackBar()` | `snackbarHostState.showSnackbar()` |
| Pull to refresh | `RefreshIndicator` | `PullToRefreshBox` (Material3) |
| FAB | `floatingActionButton:` en Scaffold | `floatingActionButton =` en Scaffold |
| Bottom Nav | `BottomNavigationBar` | `NavigationBar` (Material3) |

---

## 6. Orden de implementación

```
1.  Crear proyecto Android Studio (Empty Activity con Compose)
2.  Agregar dependencias al build.gradle
3.  Configurar LavaderoTheme (oscuro)
4.  TokenStorage
5.  ApiClient + AuthInterceptor
6.  ApiService (todos los endpoints)
7.  Modelos (data class)
8.  LoginViewModel + LoginScreen
9.  AppNavigation con redirección por rol
10. DashboardScreen (admin)
11. MisTurnosScreen (trabajador)
12. DetalleTurnoScreen + cambio de estado
13. NuevoTurnoScreen (wizard 3 pasos)
14. CobrarScreen
15. CajaScreen
16. ClientesScreen + ClienteDetalleScreen
17. PerfilScreen
18. RealtimeService (Socket.IO)
19. Conectar WebSocket al Dashboard y Turnos
20. Pulir UX
```

---

## 7. URL del backend

```kotlin
object ApiConfig {
    const val BASE_URL = "http://10.0.2.2:3000/"  // Emulador
    // const val BASE_URL = "http://192.168.1.X:3000/"  // Dispositivo físico
    // const val BASE_URL = "https://api.tudominio.com/"  // Producción
}
```
