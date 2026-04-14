import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
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
  crear(@Body() dto: CrearServicioDto, @UsuarioActual() usuario: Usuario) {
    return this.serviciosService.crear(dto, usuario.tenantId!);
  }

  @Get()
  buscarTodos(@Query('soloActivos') soloActivos: string | undefined, @UsuarioActual() usuario: Usuario) {
    return this.serviciosService.buscarTodos(usuario.tenantId!, soloActivos === 'true');
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.serviciosService.buscarPorId(id, usuario.tenantId!);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarServicioDto,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.serviciosService.actualizar(id, dto, usuario.tenantId!);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.serviciosService.eliminar(id, usuario.tenantId!);
  }
}
