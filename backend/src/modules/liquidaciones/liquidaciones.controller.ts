import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { LiquidacionesService } from './liquidaciones.service';
import { CrearLiquidacionDto } from './dto/crear-liquidacion.dto';

@Controller('liquidaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class LiquidacionesController {
  constructor(private readonly liquidacionesService: LiquidacionesService) {}

  @Post()
  crear(@Body() dto: CrearLiquidacionDto, @UsuarioActual() usuario: Usuario) {
    return this.liquidacionesService.crear(dto, usuario.tenantId!);
  }

  @Get()
  buscarTodas(@UsuarioActual() usuario: Usuario) {
    return this.liquidacionesService.buscarTodas(usuario.tenantId!);
  }

  // Ruta accesible para cualquier usuario autenticado (no solo admin)
  @Get('mias')
  @Roles()
  misLiquidaciones(@UsuarioActual() usuario: Usuario) {
    return this.liquidacionesService.buscarPorTrabajador(usuario.id, usuario.tenantId!);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.liquidacionesService.buscarPorId(id, usuario.tenantId!);
  }

  @Get(':id/turnos')
  buscarTurnos(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.liquidacionesService.buscarTurnosDeLiquidacion(id, usuario.tenantId!);
  }

  @Patch(':id/pagar')
  marcarPagada(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.liquidacionesService.marcarPagada(id, usuario.tenantId!);
  }
}
