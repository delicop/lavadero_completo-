import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
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
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    return this.reportesService.obtenerReporte(
      usuario.tenantId!,
      desde ?? hoy,
      hasta ?? hoy,
    );
  }
}
