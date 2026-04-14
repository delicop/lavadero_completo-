import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { VehiculosService } from './vehiculos.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { ActualizarVehiculoDto } from './dto/actualizar-vehiculo.dto';

@Controller('vehiculos')
@UseGuards(JwtAuthGuard)
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  crear(@Body() dto: CrearVehiculoDto, @UsuarioActual() usuario: Usuario) {
    return this.vehiculosService.crear(dto, usuario.tenantId!);
  }

  @Get()
  buscarTodos(@UsuarioActual() usuario: Usuario) {
    return this.vehiculosService.buscarTodos(usuario.tenantId!);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.vehiculosService.buscarPorId(id, usuario.tenantId!);
  }

  @Get('cliente/:clienteId')
  buscarPorCliente(@Param('clienteId') clienteId: string, @UsuarioActual() usuario: Usuario) {
    return this.vehiculosService.buscarPorCliente(clienteId, usuario.tenantId!);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarVehiculoDto,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.vehiculosService.actualizar(id, dto, usuario.tenantId!);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.vehiculosService.eliminar(id, usuario.tenantId!);
  }
}
