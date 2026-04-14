import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { RegistrarGastoDto } from './dto/registrar-gasto.dto';
import { RegistrarIngresoManualDto } from './dto/registrar-ingreso-manual.dto';

@Controller('caja')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get('estado')
  obtenerEstado(@UsuarioActual() usuario: Usuario) {
    return this.cajaService.obtenerEstado(usuario.tenantId!);
  }

  @Post('abrir')
  abrir(@Body() dto: AbrirCajaDto, @UsuarioActual() usuario: Usuario) {
    return this.cajaService.abrir(dto, usuario.id, usuario.tenantId!);
  }

  @Get('resumen/:cajaDiaId')
  resumen(@Param('cajaDiaId') cajaDiaId: string, @UsuarioActual() usuario: Usuario) {
    return this.cajaService.calcularResumen(cajaDiaId, usuario.tenantId!);
  }

  @Post('cerrar/:cajaDiaId')
  cerrar(@Param('cajaDiaId') cajaDiaId: string, @UsuarioActual() usuario: Usuario) {
    return this.cajaService.cerrar(cajaDiaId, usuario.id, usuario.tenantId!);
  }

  @Post('gastos')
  registrarGasto(@Body() dto: RegistrarGastoDto, @UsuarioActual() usuario: Usuario) {
    return this.cajaService.registrarGasto(dto, usuario.id, usuario.tenantId!);
  }

  @Delete('gastos/:id')
  eliminarGasto(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.cajaService.eliminarGasto(id, usuario.tenantId!);
  }

  @Post('ingresos-manuales')
  registrarIngreso(@Body() dto: RegistrarIngresoManualDto, @UsuarioActual() usuario: Usuario) {
    return this.cajaService.registrarIngresoManual(dto, usuario.id, usuario.tenantId!);
  }

  @Delete('ingresos-manuales/:id')
  eliminarIngreso(@Param('id') id: string, @UsuarioActual() usuario: Usuario) {
    return this.cajaService.eliminarIngresoManual(id, usuario.tenantId!);
  }

  @Get('historial')
  historial(@UsuarioActual() usuario: Usuario) {
    return this.cajaService.historial(usuario.tenantId!);
  }

  @Get('facturas/:cajaDiaId')
  listarFacturasDia(@Param('cajaDiaId') cajaDiaId: string, @UsuarioActual() usuario: Usuario) {
    return this.cajaService.listarFacturasDia(cajaDiaId, usuario.tenantId!);
  }
}
