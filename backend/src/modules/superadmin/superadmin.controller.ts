import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../usuarios/entities/usuario.entity';
import { SuperadminService } from './superadmin.service';
import { TenantsService } from '../tenants/tenants.service';
import { LogsService } from '../logs/logs.service';
import { TipoLog, OrigenLog } from '../logs/entities/log.entity';

@Controller('superadmin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.SUPERADMIN)
export class SuperadminController {
  constructor(
    private readonly superadminService: SuperadminService,
    private readonly tenantsService: TenantsService,
    private readonly logsService: LogsService,
  ) {}

  // ── Métricas ──────────────────────────────────────────────────────────────────

  @Get('metricas')
  obtenerMetricas() {
    return this.superadminService.obtenerMetricas();
  }

  // ── Tenants ───────────────────────────────────────────────────────────────────

  @Get('tenants')
  listarTenants() {
    return this.superadminService.listarTenants();
  }

  @Patch('tenants/:id/toggle-activo')
  @HttpCode(HttpStatus.OK)
  toggleActivoTenant(@Param('id') id: string) {
    return this.tenantsService.toggleActivo(id);
  }

  @Delete('tenants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminarTenant(@Param('id') id: string) {
    return this.tenantsService.eliminar(id);
  }

  // ── Usuarios ──────────────────────────────────────────────────────────────────

  @Get('usuarios')
  listarUsuarios(@Query('tenantId') tenantId?: string) {
    return this.superadminService.listarUsuarios(tenantId);
  }

  @Patch('usuarios/:id/toggle-activo')
  @HttpCode(HttpStatus.OK)
  toggleActivoUsuario(@Param('id') id: string) {
    return this.superadminService.toggleActivoUsuario(id);
  }

  @Patch('usuarios/:id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  cambiarPassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.superadminService.cambiarPasswordUsuario(id, body.password);
  }

  @Delete('usuarios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminarUsuario(@Param('id') id: string) {
    return this.superadminService.eliminarUsuario(id);
  }

  // ── Logs ──────────────────────────────────────────────────────────────────────

  @Get('logs')
  listarLogs(
    @Query('resuelto') resuelto?: string,
    @Query('tipo') tipo?: TipoLog,
    @Query('origen') origen?: OrigenLog,
    @Query('limite') limite?: string,
  ) {
    return this.logsService.listar({
      resuelto: resuelto === 'true' ? true : resuelto === 'false' ? false : undefined,
      tipo,
      origen,
      limite: limite ? parseInt(limite, 10) : undefined,
    });
  }

  @Patch('logs/:id/resolver')
  @HttpCode(HttpStatus.OK)
  resolverLog(@Param('id') id: string) {
    return this.logsService.marcarResuelto(id);
  }
}
