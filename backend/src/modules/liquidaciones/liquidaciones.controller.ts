import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { LiquidacionesService } from './liquidaciones.service';
import { CrearLiquidacionDto } from './dto/crear-liquidacion.dto';

@Controller('liquidaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class LiquidacionesController {
  constructor(private readonly liquidacionesService: LiquidacionesService) {}

  @Post()
  crear(@Body() dto: CrearLiquidacionDto) {
    return this.liquidacionesService.crear(dto);
  }

  @Get()
  buscarTodas() {
    return this.liquidacionesService.buscarTodas();
  }

  // Ruta accesible para cualquier usuario autenticado (no solo admin)
  @Get('mias')
  @Roles()
  misLiquidaciones(@UsuarioActual() usuario: Usuario) {
    return this.liquidacionesService.buscarPorTrabajador(usuario.id);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.liquidacionesService.buscarPorId(id);
  }

  @Get(':id/turnos')
  buscarTurnos(@Param('id') id: string) {
    return this.liquidacionesService.buscarTurnosDeLiquidacion(id);
  }

  @Patch(':id/pagar')
  marcarPagada(@Param('id') id: string) {
    return this.liquidacionesService.marcarPagada(id);
  }
}
