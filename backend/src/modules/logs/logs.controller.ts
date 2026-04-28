import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { LogsService } from './logs.service';
import { CrearLogFrontendDto } from './dto/crear-log-frontend.dto';
import { TipoLog, OrigenLog } from './entities/log.entity';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post('frontend')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrarFrontend(
    @Body() dto: CrearLogFrontendDto,
    @UsuarioActual() usuario: Usuario,
  ): Promise<void> {
    await this.logsService.registrar({
      tipo:      TipoLog.ERROR,
      origen:    OrigenLog.FRONTEND,
      mensaje:   dto.mensaje,
      detalle:   dto.detalle,
      ruta:      dto.ruta,
      tenantId:  usuario.tenantId,
      usuarioId: usuario.id,
    });
  }
}
