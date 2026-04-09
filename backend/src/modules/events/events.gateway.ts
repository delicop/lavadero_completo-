import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/eventos',
})
export class EventsGateway {
  @WebSocketServer()
  private readonly server: Server;

  emitirTurnoActualizado(turnoId: string, estado: string): void {
    this.server.emit('turno:actualizado', { turnoId, estado });
  }

  emitirUsuarioActualizado(usuarioId: string, disponible: boolean): void {
    this.server.emit('usuario:actualizado', { usuarioId, disponible });
  }
}
