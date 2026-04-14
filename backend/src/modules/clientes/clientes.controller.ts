import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  crear(@Body() dto: CrearClienteDto, @UsuarioActual() usuario: Usuario) {
    return this.clientesService.crear(dto, usuario.tenantId!);
  }

  @Get()
  buscarTodos(@UsuarioActual() usuario: Usuario) {
    return this.clientesService.buscarTodos(usuario.tenantId!);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.clientesService.buscarPorId(id, usuario.tenantId!);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarClienteDto,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.clientesService.actualizar(id, dto, usuario.tenantId!);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.clientesService.eliminar(id, usuario.tenantId!);
  }
}
