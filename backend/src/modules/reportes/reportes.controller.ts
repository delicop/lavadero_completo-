import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { FechaFiltroPipe } from '../../common/pipes/fecha-filtro.pipe';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { ReportesService } from './reportes.service';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  obtener(
    @UsuarioActual() usuario: Usuario,
    @Query('desde', FechaFiltroPipe) desde?: string,
    @Query('hasta', FechaFiltroPipe) hasta?: string,
  ) {
    return this.reportesService.obtenerReporte(usuario.tenantId!, desde, hasta);
  }
}
