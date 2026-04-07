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
import { RolUsuario } from '../usuarios/entities/usuario.entity';
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
  crear(@Body() dto: CrearTurnoDto) {
    return this.turnosService.crear(dto);
  }

  @Get()
  buscarTodos(
    @Query('estado') estado?: EstadoTurno,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.turnosService.buscarTodos(estado, fechaDesde, fechaHasta);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.turnosService.buscarPorId(id);
  }

  @Get('trabajador/:trabajadorId')
  buscarPorTrabajador(
    @Param('trabajadorId') trabajadorId: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.turnosService.buscarPorTrabajador(trabajadorId, fechaDesde, fechaHasta);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarTurnoDto) {
    return this.turnosService.actualizar(id, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body() dto: ActualizarEstadoDto) {
    return this.turnosService.cambiarEstado(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  eliminar(@Param('id') id: string) {
    return this.turnosService.eliminar(id);
  }
}
