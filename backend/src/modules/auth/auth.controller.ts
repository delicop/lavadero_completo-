import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { RegistrarTenantDto } from './dto/registrar-tenant.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  registrar(@Body() dto: RegistrarTenantDto) {
    return this.authService.registrar(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@UsuarioActual() usuario: Usuario) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...resto } = usuario;
    return resto;
  }

  @Patch('cambiar-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  cambiarPassword(@UsuarioActual() usuario: Usuario, @Body() dto: CambiarPasswordDto) {
    return this.authService.cambiarPassword(usuario.id, dto);
  }

  @Patch('disponibilidad')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  disponibilidad(@UsuarioActual() usuario: Usuario, @Body() body: { disponible: boolean }) {
    return this.authService.actualizarDisponibilidad(usuario.id, body.disponible);
  }

  @Get('historial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  historial(@Query('limit') limit?: string) {
    return this.authService.historialLogin(Number(limit) || 100);
  }
}
