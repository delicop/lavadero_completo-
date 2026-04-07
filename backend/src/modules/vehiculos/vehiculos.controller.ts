import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VehiculosService } from './vehiculos.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { ActualizarVehiculoDto } from './dto/actualizar-vehiculo.dto';

@Controller('vehiculos')
@UseGuards(JwtAuthGuard)
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  crear(@Body() dto: CrearVehiculoDto) {
    return this.vehiculosService.crear(dto);
  }

  @Get()
  buscarTodos() {
    return this.vehiculosService.buscarTodos();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.vehiculosService.buscarPorId(id);
  }

  @Get('cliente/:clienteId')
  buscarPorCliente(@Param('clienteId') clienteId: string) {
    return this.vehiculosService.buscarPorCliente(clienteId);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarVehiculoDto) {
    return this.vehiculosService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.vehiculosService.eliminar(id);
  }
}
