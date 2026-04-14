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
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  crear(@Body() dto: CrearUsuarioDto, @UsuarioActual() usuario: Usuario) {
    return this.usuariosService.crear(dto, usuario.tenantId!);
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
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarUsuarioDto,
    @UsuarioActual() usuario: Usuario,
  ) {
    return this.usuariosService.actualizar(id, dto, usuario.tenantId!);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.usuariosService.eliminar(id, usuario.tenantId!);
  }
}
