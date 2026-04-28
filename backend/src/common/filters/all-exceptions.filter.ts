import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogsService } from '../../modules/logs/logs.service';
import { TipoLog, OrigenLog } from '../../modules/logs/entities/log.entity';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logsService: LogsService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    const isHttp   = exception instanceof HttpException;
    const status   = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Solo loguear errores no controlados (500+)
    if (status >= 500) {
      const mensaje = exception instanceof Error ? exception.message : 'Error interno desconocido';
      const detalle = exception instanceof Error ? exception.stack   : undefined;
      const usuario = (request as any).user as { sub?: string; tenantId?: string } | undefined;

      void this.logsService.registrar({
        tipo:      TipoLog.ERROR,
        origen:    OrigenLog.BACKEND,
        mensaje:   mensaje,
        detalle:   detalle,
        ruta:      `${request.method} ${request.url}`,
        tenantId:  usuario?.tenantId ?? null,
        usuarioId: usuario?.sub      ?? null,
      });
    }

    const body = isHttp
      ? exception.getResponse()
      : { statusCode: status, message: 'Error interno del servidor' };

    response.status(status).json(
      typeof body === 'object' ? body : { statusCode: status, message: body },
    );
  }
}
