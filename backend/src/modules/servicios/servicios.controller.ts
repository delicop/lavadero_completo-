import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../usuarios/entities/usuario.entity';
import { ServiciosService } from './servicios.service';
import { CrearServicioDto } from './dto/crear-servicio.dto';
import { ActualizarServicioDto } from './dto/actualizar-servicio.dto';

@Controller('servicios')
@UseGuards(JwtAuthGuard)
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  crear(@Body() dto: CrearServicioDto) {
    return this.serviciosService.crear(dto);
  }

  @Get()
  buscarTodos(@Query('soloActivos') soloActivos?: string) {
    return this.serviciosService.buscarTodos(soloActivos === 'true');
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.serviciosService.buscarPorId(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarServicioDto) {
    return this.serviciosService.actualizar(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  eliminar(@Param('id') id: string) {
    return this.serviciosService.eliminar(id);
  }
}
