import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/auth/auth_provider.dart';
import '../../shared/theme/colores.dart';
import '../../shared/widgets/input_field.dart';
import 'perfil_provider.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  Future<void> _cambiarPassword() async {
    final actualCtrl = TextEditingController();
    final nuevaCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: colorSuperficie,
        title: const Text('Cambiar contraseña'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            InputField(
                label: 'Contraseña actual',
                controller: actualCtrl,
                obscureText: true),
            const SizedBox(height: 12),
            InputField(
                label: 'Nueva contraseña',
                controller: nuevaCtrl,
                obscureText: true),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () async {
              if (actualCtrl.text.isEmpty || nuevaCtrl.text.isEmpty) return;
              Navigator.pop(context);
              await context
                  .read<PerfilProvider>()
                  .cambiarPassword(actualCtrl.text, nuevaCtrl.text);
              if (mounted) {
                final prov = context.read<PerfilProvider>();
                final msg = prov.exito ?? prov.error ?? '';
                ScaffoldMessenger.of(context)
                    .showSnackBar(SnackBar(content: Text(msg)));
              }
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  Future<void> _logout() async {
    await context.read<PerfilProvider>().logout();
    if (mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.read<AuthProvider>().usuario!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        automaticallyImplyLeading: false,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 16),
            CircleAvatar(
              radius: 40,
              backgroundColor: colorPrimario.withValues(alpha: 0.2),
              child: Text(
                usuario.nombre[0].toUpperCase(),
                style: const TextStyle(
                    fontSize: 32,
                    color: colorPrimario,
                    fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              usuario.nombreCompleto,
              style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.w700),
            ),
            Text(usuario.email,
                style: const TextStyle(color: colorSubtexto)),
            const SizedBox(height: 8),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: colorPrimario.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(usuario.rol,
                  style: const TextStyle(
                      color: colorPrimario, fontSize: 13)),
            ),
            const SizedBox(height: 40),
            if (usuario.esAdmin) ...[
              OutlinedButton.icon(
                icon: const Icon(Icons.people_outline),
                label: const Text('Gestionar personal'),
                onPressed: () => context.push('/personal'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: colorPrimario,
                  minimumSize: const Size(double.infinity, 52),
                  side: const BorderSide(color: colorPrimario),
                ),
              ),
              const SizedBox(height: 12),
            ],
            OutlinedButton.icon(
              icon: const Icon(Icons.lock_outline),
              label: const Text('Cambiar contraseña'),
              onPressed: _cambiarPassword,
              style: OutlinedButton.styleFrom(
                foregroundColor: colorTexto,
                minimumSize: const Size(double.infinity, 52),
                side: const BorderSide(color: colorDivisor),
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              icon: const Icon(Icons.logout, color: colorCancelado),
              label: const Text('Cerrar sesión',
                  style: TextStyle(color: colorCancelado)),
              onPressed: _logout,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: colorCancelado),
                minimumSize: const Size(double.infinity, 52),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
