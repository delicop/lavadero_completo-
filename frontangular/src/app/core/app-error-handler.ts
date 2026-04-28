import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { LogsService } from './services/logs.service';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);

  handleError(error: unknown): void {
    console.error(error);

    try {
      const logsService = this.injector.get(LogsService);
      const mensaje = error instanceof Error ? error.message : String(error);
      const detalle = error instanceof Error ? error.stack : undefined;
      const ruta    = window.location.pathname;
      logsService.registrarError(
        mensaje.slice(0, 500),
        detalle?.slice(0, 5000),
        ruta,
      );
    } catch { /* injector may not be ready yet */ }
  }
}
