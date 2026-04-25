import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { FacturacionService } from './facturacion.service';
import { CrearFacturaDto } from './dto/crear-factura.dto';

@Controller('facturacion')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Post()
  crear(@Body() dto: CrearFacturaDto, @UsuarioActual() usuario: Usuario) {
    return this.facturacionService.crear(dto, usuario.tenantId!);
  }

  @Get()
  buscarTodas(
    @UsuarioActual() usuario: Usuario,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.facturacionService.buscarTodas(usuario.tenantId!, fechaDesde, fechaHasta);
  }

  @Get('turno/:turnoId')
  buscarPorTurno(@Param('turnoId') turnoId: string, @UsuarioActual() usuario: Usuario) {
    return this.facturacionService.buscarPorTurno(turnoId, usuario.tenantId!);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.facturacionService.buscarPorId(id, usuario.tenantId!);
  }
}
