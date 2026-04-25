import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { EstadoTurno } from './entities/turno.entity';
import { TurnosService } from './turnos.service';
import { CrearTurnoDto } from './dto/crear-turno.dto';
import { ActualizarTurnoDto } from './dto/actualizar-turno.dto';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';

@Controller('turnos')
@UseGuards(JwtAuthGuard)
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  crear(@Body() dto: CrearTurnoDto, @UsuarioActual() usuario: Usuario) {
    return this.turnosService.crear(dto, usuario.tenantId!);
  }

  @Get()
  buscarTodos(
    @UsuarioActual() usuario: Usuario,
    @Query('estado') estado?: EstadoTurno,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.turnosService.buscarTodos(usuario.tenantId!, estado, fechaDesde, fechaHasta);
  }

  @Get('trabajador/:trabajadorId')
  buscarPorTrabajador(
    @Param('trabajadorId') trabajadorId: string,
    @UsuarioActual() usuario: Usuario,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.turnosService.buscarPorTrabajador(trabajadorId, usuario.tenantId!, fechaDesde, fechaHasta);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.turnosService.buscarPorId(id, usuario.tenantId!);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarTurnoDto,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.turnosService.actualizar(id, dto, usuario.tenantId!);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() dto: ActualizarEstadoDto,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.turnosService.cambiarEstado(id, dto, usuario.tenantId!);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.turnosService.eliminar(id, usuario.tenantId!);
  }
}
