import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../usuarios/entities/usuario.entity';
import { FacturacionService } from './facturacion.service';
import { CrearFacturaDto } from './dto/crear-factura.dto';

@Controller('facturacion')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Post()
  crear(@Body() dto: CrearFacturaDto) {
    return this.facturacionService.crear(dto);
  }

  @Get()
  buscarTodas(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.facturacionService.buscarTodas(fechaDesde, fechaHasta);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.facturacionService.buscarPorId(id);
  }

  @Get('turno/:turnoId')
  buscarPorTurno(@Param('turnoId') turnoId: string) {
    return this.facturacionService.buscarPorTurno(turnoId);
  }
}
