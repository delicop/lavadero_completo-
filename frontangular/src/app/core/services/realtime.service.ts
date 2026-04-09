import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface TurnoActualizadoEvent {
  turnoId: string;
  estado: string;
}

export interface UsuarioActualizadoEvent {
  usuarioId: string;
  disponible: boolean;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private socket: Socket | null = null;

  private readonly turnoActualizado$ = new Subject<TurnoActualizadoEvent>();
  private readonly usuarioActualizado$ = new Subject<UsuarioActualizadoEvent>();

  /** Observable al que se suscriben los componentes */
  readonly onTurnoActualizado$ = this.turnoActualizado$.asObservable();
  readonly onUsuarioActualizado$ = this.usuarioActualizado$.asObservable();

  conectar(): void {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3000/eventos', {
      transports: ['websocket'],
    });

    this.socket.on('turno:actualizado', (data: TurnoActualizadoEvent) => {
      this.turnoActualizado$.next(data);
    });

    this.socket.on('usuario:actualizado', (data: UsuarioActualizadoEvent) => {
      this.usuarioActualizado$.next(data);
    });
  }

  desconectar(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.desconectar();
  }
}
