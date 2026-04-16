import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';
import { EventsGateway } from '../events/events.gateway';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly events: EventsGateway,
  ) {}

  @Post()
  async crear(@Body() dto: CrearUsuarioDto, @UsuarioActual() usuario: Usuario) {
    const result = await this.usuariosService.crear(dto, usuario.tenantId!);
    this.events.emitirUsuarioCambiado();
    return result;
  }

  @Get()
  buscarTodos(@UsuarioActual() usuario: Usuario) {
    return this.usuariosService.buscarTodos(usuario.tenantId!);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.usuariosService.buscarPorId(id, usuario.tenantId!);
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarUsuarioDto,
    @UsuarioActual() usuario: Usuario,
  ) {
    const result = await this.usuariosService.actualizar(id, dto, usuario.tenantId!);
    this.events.emitirUsuarioCambiado();
    return result;
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    await this.usuariosService.eliminar(id, usuario.tenantId!);
    this.events.emitirUsuarioCambiado();
  }
}
