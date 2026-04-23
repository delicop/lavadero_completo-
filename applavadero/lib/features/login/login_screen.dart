import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/auth/auth_provider.dart';
import '../../shared/theme/colores.dart';
import '../../shared/widgets/boton_primario.dart';
import '../../shared/widgets/input_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey   = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  bool _verPassword = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final ok = await auth.login(_emailCtrl.text.trim(), _passCtrl.text);
    if (ok && mounted) {
      context.go(auth.usuario!.esAdmin ? '/dashboard' : '/mis-turnos');
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: colorFondo,
      body: Stack(
        children: [
          // Glow de fondo centrado arriba
          Positioned(
            top: -80,
            left: size.width / 2 - 160,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    colorPrimario.withValues(alpha: 0.18),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    SizedBox(height: size.height * 0.10),

                    // Logo
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: colorSuperficie,
                        border: Border.all(
                          color: colorPrimario.withValues(alpha: 0.5),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: colorPrimario.withValues(alpha: 0.35),
                            blurRadius: 32,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.local_car_wash_rounded,
                        size: 40,
                        color: colorPrimario,
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Nombre de la app
                    Text(
                      'LAVADERO',
                      style: GoogleFonts.barlowCondensed(
                        fontSize: 42,
                        fontWeight: FontWeight.w700,
                        color: colorTexto,
                        letterSpacing: 4,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Sistema de gestión',
                      style: GoogleFonts.dmSans(
                        fontSize: 14,
                        color: colorSubtexto,
                        letterSpacing: 0.3,
                      ),
                    ),

                    SizedBox(height: size.height * 0.08),

                    // Formulario
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: colorSuperficie,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: colorDivisor),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.3),
                            blurRadius: 24,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            'Ingresá a tu cuenta',
                            style: GoogleFonts.barlowCondensed(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: colorTexto,
                              letterSpacing: 0.3,
                            ),
                          ),
                          const SizedBox(height: 24),

                          InputField(
                            label: 'Email',
                            hint: 'tu@email.com',
                            controller: _emailCtrl,
                            keyboardType: TextInputType.emailAddress,
                            validator: (v) =>
                                v!.isEmpty ? 'Ingresá tu email' : null,
                          ),
                          const SizedBox(height: 16),

                          InputField(
                            label: 'Contraseña',
                            hint: '••••••••',
                            controller: _passCtrl,
                            obscureText: !_verPassword,
                            validator: (v) =>
                                v!.isEmpty ? 'Ingresá tu contraseña' : null,
                            suffix: IconButton(
                              icon: Icon(
                                _verPassword
                                    ? Icons.visibility_off_rounded
                                    : Icons.visibility_rounded,
                                color: colorSubtexto,
                                size: 20,
                              ),
                              onPressed: () =>
                                  setState(() => _verPassword = !_verPassword),
                            ),
                          ),

                          const SizedBox(height: 28),

                          Consumer<AuthProvider>(
                            builder: (_, auth, __) => Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                BotonPrimario(
                                  texto: 'Ingresar',
                                  loading: auth.loading,
                                  icono: Icons.arrow_forward_rounded,
                                  onPressed: _submit,
                                ),
                                if (auth.error != null) ...[
                                  const SizedBox(height: 14),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 14, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: colorCancelado
                                          .withValues(alpha: 0.10),
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: colorCancelado
                                            .withValues(alpha: 0.35),
                                      ),
                                    ),
                                    child: Text(
                                      auth.error!,
                                      textAlign: TextAlign.center,
                                      style: GoogleFonts.dmSans(
                                        color: colorCancelado,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 40),

                    Text(
                      'v1.0 · Lavadero App',
                      style: GoogleFonts.dmSans(
                        color: colorSubtexto.withValues(alpha: 0.5),
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
