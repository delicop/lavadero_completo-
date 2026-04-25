import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
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
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    if (desde && !ISO_DATE.test(desde)) throw new BadRequestException('El parámetro "desde" debe tener formato YYYY-MM-DD');
    if (hasta && !ISO_DATE.test(hasta)) throw new BadRequestException('El parámetro "hasta" debe tener formato YYYY-MM-DD');
    return this.reportesService.obtenerReporte(usuario.tenantId!, desde, hasta);
  }
}
