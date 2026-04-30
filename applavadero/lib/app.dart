import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'core/auth/auth_provider.dart';
import 'core/auth/token_storage.dart';
import 'core/api/api_client.dart';
import 'core/services/auth_service.dart';
import 'core/services/turno_service.dart';
import 'core/services/cliente_service.dart';
import 'core/services/vehiculo_service.dart';
import 'core/services/servicio_service.dart';
import 'core/services/caja_service.dart';
import 'core/services/facturacion_service.dart';
import 'core/services/realtime_service.dart';
import 'core/services/tenant_service.dart';
import 'features/login/login_screen.dart';
import 'features/dashboard/dashboard_screen.dart';
import 'features/dashboard/mis_turnos_screen.dart';
import 'features/dashboard/dashboard_provider.dart';
import 'features/turnos/turnos_screen.dart';
import 'features/turnos/turnos_provider.dart';
import 'features/turnos/detalle_turno_screen.dart';
import 'features/turnos/nuevo_turno_screen.dart';
import 'features/turnos/cobrar_screen.dart';
import 'features/caja/caja_screen.dart';
import 'features/caja/caja_provider.dart';
import 'features/clientes/clientes_screen.dart';
import 'features/clientes/clientes_provider.dart';
import 'features/clientes/cliente_detalle_screen.dart';
import 'features/clientes/nuevo_cliente_screen.dart';
import 'features/perfil/perfil_screen.dart';
import 'features/perfil/perfil_provider.dart';
import 'features/personal/personal_screen.dart';
import 'features/personal/personal_provider.dart';
import 'features/servicios/servicios_screen.dart';
import 'features/servicios/servicios_provider.dart';
import 'features/negocio/negocio_screen.dart';
import 'shared/theme/colores.dart';
import 'shared/theme/tema.dart';

class AppLavadero extends StatefulWidget {
  const AppLavadero({super.key});

  @override
  State<AppLavadero> createState() => _AppLavaderoState();
}

class _AppLavaderoState extends State<AppLavadero> {
  late final TokenStorage _tokenStorage;
  late final ApiClient _apiClient;
  late final AuthService _authService;
  late final TurnoService _turnoService;
  late final ClienteService _clienteService;
  late final VehiculoService _vehiculoService;
  late final ServicioService _servicioService;
  late final CajaService _cajaService;
  late final FacturacionService _facturacionService;
  late final RealtimeService _realtimeService;
  late final TenantService _tenantService;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: colorSuperficie,
      systemNavigationBarIconBrightness: Brightness.dark,
    ));
    _tokenStorage = TokenStorage();
    _router = _buildRouter();
    _apiClient = ApiClient(
      _tokenStorage,
      onUnauthorized: () => _router.go('/login'),
    );
    _authService = AuthService(_apiClient);
    _turnoService = TurnoService(_apiClient);
    _clienteService = ClienteService(_apiClient);
    _vehiculoService = VehiculoService(_apiClient);
    _servicioService = ServicioService(_apiClient);
    _cajaService = CajaService(_apiClient);
    _facturacionService = FacturacionService(_apiClient);
    _tenantService = TenantService(_apiClient);
    _realtimeService = RealtimeService(_tokenStorage);
    _realtimeService.conectar();
  }

  @override
  void dispose() {
    _realtimeService.dispose();
    super.dispose();
  }

  GoRouter _buildRouter() {
    return GoRouter(
      initialLocation: '/login',
      redirect: (context, state) async {
        final token = await _tokenStorage.read();
        final enLogin = state.matchedLocation == '/login';
        if (token == null && !enLogin) return '/login';
        return null;
      },
      routes: [
        GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),

        // Shell admin
        ShellRoute(
          builder: (context, state, child) => _NavShell(
            child: child,
            location: state.matchedLocation,
            items: const [
              (path: '/dashboard', label: 'Inicio',   icon: Icons.home_rounded),
              (path: '/turnos',    label: 'Turnos',   icon: Icons.assignment_rounded),
              (path: '/caja',      label: 'Caja',     icon: Icons.point_of_sale_rounded),
              (path: '/clientes',  label: 'Clientes', icon: Icons.people_rounded),
              (path: '/perfil',    label: 'Perfil',   icon: Icons.person_rounded),
            ],
          ),
          routes: [
            GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
            GoRoute(path: '/turnos',    builder: (_, __) => const TurnosScreen()),
            GoRoute(path: '/caja',      builder: (_, __) => const CajaScreen()),
            GoRoute(path: '/clientes',  builder: (_, __) => const ClientesScreen()),
            GoRoute(path: '/perfil',    builder: (_, __) => const PerfilScreen()),
          ],
        ),

        // Shell trabajador
        ShellRoute(
          builder: (context, state, child) => _NavShell(
            child: child,
            location: state.matchedLocation,
            items: const [
              (path: '/mis-turnos',       label: 'Mis Turnos', icon: Icons.assignment_rounded),
              (path: '/perfil-trabajador', label: 'Perfil',    icon: Icons.person_rounded),
            ],
          ),
          routes: [
            GoRoute(path: '/mis-turnos',        builder: (_, __) => const MisTurnosScreen()),
            GoRoute(path: '/perfil-trabajador', builder: (_, __) => const PerfilScreen()),
          ],
        ),

        // Pantallas completas
        GoRoute(path: '/turnos/nuevo', builder: (_, __) => const NuevoTurnoScreen()),
        GoRoute(
          path: '/turnos/:id',
          builder: (_, state) => DetalleTurnoScreen(turnoId: state.pathParameters['id']!),
        ),
        GoRoute(
          path: '/turnos/:id/cobrar',
          builder: (_, state) => CobrarScreen(turnoId: state.pathParameters['id']!),
        ),
        GoRoute(path: '/personal',       builder: (_, __) => const PersonalScreen()),
        GoRoute(path: '/servicios',      builder: (_, __) => const ServiciosScreen()),
        GoRoute(path: '/negocio',        builder: (_, __) => const NegocioScreen()),
        GoRoute(path: '/clientes/nuevo', builder: (_, __) => const NuevoClienteScreen()),
        GoRoute(
          path: '/clientes/:id',
          builder: (_, state) => ClienteDetalleScreen(clienteId: state.pathParameters['id']!),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider.value(value: _authService),
        Provider.value(value: _turnoService),
        Provider.value(value: _clienteService),
        Provider.value(value: _vehiculoService),
        Provider.value(value: _servicioService),
        Provider.value(value: _cajaService),
        Provider.value(value: _facturacionService),
        Provider.value(value: _realtimeService),
        Provider.value(value: _tenantService),
        ChangeNotifierProvider(
          create: (_) => AuthProvider(_tokenStorage, _authService, _tenantService),
        ),
        ChangeNotifierProvider(
          create: (_) => DashboardProvider(_turnoService, _realtimeService),
        ),
        ChangeNotifierProvider(
          create: (_) => TurnosProvider(_turnoService, _realtimeService),
        ),
        ChangeNotifierProvider(create: (_) => CajaProvider(_cajaService)),
        ChangeNotifierProvider(
          create: (_) => ClientesProvider(_clienteService, _vehiculoService),
        ),
        ChangeNotifierProxyProvider<AuthProvider, PerfilProvider>(
          create: (ctx) => PerfilProvider(ctx.read<AuthProvider>(), _authService),
          update: (ctx, auth, prev) => prev ?? PerfilProvider(auth, _authService),
        ),
        ChangeNotifierProvider(create: (_) => PersonalProvider(_authService)),
        ChangeNotifierProvider(create: (_) => ServiciosProvider(_servicioService)),
      ],
      child: Consumer<AuthProvider>(
        builder: (_, auth, __) => MaterialApp.router(
          title: auth.config?.nombreMostrar ?? 'Lavadero',
          theme: buildTema(
            colorPrimarioHex:   auth.config?.colorPrimario,
            colorFondoHex:      auth.config?.colorFondo,
            colorSuperficieHex: auth.config?.colorSuperficie,
          ),
          routerConfig: _router,
          debugShowCheckedModeBanner: false,
        ),
      ),
    );
  }
}

// ─── Nav Item type ─────────────────────────────────────────────────────────

typedef _NavItem = ({String path, String label, IconData icon});

// ─── Shell con floating nav ────────────────────────────────────────────────

class _NavShell extends StatelessWidget {
  final Widget child;
  final String location;
  final List<_NavItem> items;

  const _NavShell({
    required this.child,
    required this.location,
    required this.items,
  });

  int get _currentIndex {
    for (var i = 0; i < items.length; i++) {
      if (location.startsWith(items[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: child,
      bottomNavigationBar: _FloatingNav(
        items: items,
        currentIndex: _currentIndex,
        onTap: (i) => context.go(items[i].path),
      ),
    );
  }
}

class _FloatingNav extends StatelessWidget {
  final List<_NavItem> items;
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _FloatingNav({
    required this.items,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        child: Container(
          decoration: BoxDecoration(
            color: colorSuperficie,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: colorDivisor),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              final selected = i == currentIndex;
              return GestureDetector(
                onTap: () => onTap(i),
                behavior: HitTestBehavior.opaque,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOut,
                  padding: EdgeInsets.symmetric(
                    horizontal: selected ? 16 : 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: selected
                        ? colorPrimario.withValues(alpha: 0.10)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        item.icon,
                        size: 20,
                        color: selected ? colorPrimario : colorSubtexto,
                      ),
                      if (selected) ...[
                        const SizedBox(width: 6),
                        Text(
                          item.label,
                          style: GoogleFonts.dmSans(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: colorPrimario,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
