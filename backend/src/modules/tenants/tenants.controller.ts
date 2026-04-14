import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { TenantsService } from './tenants.service';
import { ActualizarConfigTenantDto } from './dto/actualizar-config-tenant.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('config')
  obtenerConfig(@UsuarioActual() usuario: Usuario) {
    return this.tenantsService.buscarPorId(usuario.tenantId!);
  }

  @Patch('config')
  @HttpCode(HttpStatus.OK)
  actualizarConfig(
    @UsuarioActual() usuario: Usuario,
    @Body() dto: ActualizarConfigTenantDto,
  ) {
    return this.tenantsService.actualizarConfig(usuario.tenantId!, dto);
  }
}
