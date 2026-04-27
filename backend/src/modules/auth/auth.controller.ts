import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { RegistrarTenantDto } from './dto/registrar-tenant.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  maxAge:   24 * 60 * 60 * 1000,
  path:     '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, rol, config } = await this.authService.login(dto);
    res.cookie('access_token', accessToken, COOKIE_OPTIONS);
    return { rol, config };
  }

  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 3_600_000, limit: 5 } })
  async registrar(@Body() dto: RegistrarTenantDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, rol } = await this.authService.registrar(dto);
    res.cookie('access_token', accessToken, COOKIE_OPTIONS);
    return { rol };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@UsuarioActual() usuario: Usuario) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...resto } = usuario;
    const config = await this.authService.obtenerConfigTenant(usuario.tenantId!);
    return { ...resto, config };
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
  historial(@UsuarioActual() usuario: Usuario, @Query('limit') limit?: string) {
    return this.authService.historialLogin(Math.min(Number(limit) || 100, 500), usuario.tenantId!);
  }
}
