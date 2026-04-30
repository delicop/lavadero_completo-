import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
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
  final _storage   = const FlutterSecureStorage();

  bool _verPassword  = false;
  bool _recordar     = false;

  static const _keyEmail = 'saved_email';
  static const _keyPass  = 'saved_pass';
  static const _keyRecordar = 'recordar';

  @override
  void initState() {
    super.initState();
    _cargarCredenciales();
  }

  Future<void> _cargarCredenciales() async {
    final recordar = await _storage.read(key: _keyRecordar);
    if (recordar == 'true') {
      final email = await _storage.read(key: _keyEmail);
      final pass  = await _storage.read(key: _keyPass);
      if (mounted) {
        setState(() {
          _recordar = true;
          _emailCtrl.text = email ?? '';
          _passCtrl.text  = pass  ?? '';
        });
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_recordar) {
      await _storage.write(key: _keyRecordar, value: 'true');
      await _storage.write(key: _keyEmail, value: _emailCtrl.text.trim());
      await _storage.write(key: _keyPass,  value: _passCtrl.text);
    } else {
      await _storage.delete(key: _keyRecordar);
      await _storage.delete(key: _keyEmail);
      await _storage.delete(key: _keyPass);
    }

    if (!mounted) return;
    final auth = context.read<AuthProvider>();
    final ok = await auth.login(_emailCtrl.text.trim(), _passCtrl.text);
    if (ok && mounted) {
      context.go(auth.usuario!.esAdmin ? '/dashboard' : '/mis-turnos');
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: colorFondo,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: size.height * 0.08),

                // Logo del negocio
                Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.asset(
                      'assets/images/logo.jpeg',
                      height: 130,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),

                SizedBox(height: size.height * 0.05),

                Text(
                  'Bienvenido',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 34,
                    fontWeight: FontWeight.w700,
                    color: colorTexto,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Ingresá a tu cuenta para continuar',
                  style: GoogleFonts.dmSans(
                    fontSize: 15,
                    color: colorSubtexto,
                  ),
                ),

                const SizedBox(height: 36),

                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: colorSuperficie,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: colorDivisor),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      InputField(
                        label: 'Correo electrónico',
                        hint: 'tu@email.com',
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        validator: (v) =>
                            v!.isEmpty ? 'Ingresá tu email' : null,
                      ),
                      const SizedBox(height: 18),
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
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: colorSubtexto,
                            size: 20,
                          ),
                          onPressed: () =>
                              setState(() => _verPassword = !_verPassword),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Recordar usuario
                      GestureDetector(
                        onTap: () => setState(() => _recordar = !_recordar),
                        child: Row(
                          children: [
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                color: _recordar
                                    ? colorPrimario
                                    : colorSuperficieAlta,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: _recordar
                                      ? colorPrimario
                                      : colorDivisor,
                                ),
                              ),
                              child: _recordar
                                  ? const Icon(Icons.check_rounded,
                                      size: 13, color: Colors.white)
                                  : null,
                            ),
                            const SizedBox(width: 10),
                            Text(
                              'Recordar usuario y contraseña',
                              style: GoogleFonts.dmSans(
                                fontSize: 13,
                                color: colorSubtexto,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

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
                                  color: colorCancelado.withValues(alpha: 0.06),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: colorCancelado
                                        .withValues(alpha: 0.25),
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

                Center(
                  child: Text(
                    'v1.0 · Lavadero App',
                    style: GoogleFonts.dmSans(
                      color: colorSubtexto.withValues(alpha: 0.5),
                      fontSize: 11,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
