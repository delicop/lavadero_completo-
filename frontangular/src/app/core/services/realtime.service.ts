import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
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
  private readonly ngZone = inject(NgZone);
  private socket: Socket | null = null;

  private readonly turnoActualizado$ = new Subject<TurnoActualizadoEvent>();
  private readonly usuarioActualizado$ = new Subject<UsuarioActualizadoEvent>();

  readonly onTurnoActualizado$ = this.turnoActualizado$.asObservable();
  readonly onUsuarioActualizado$ = this.usuarioActualizado$.asObservable();

  conectar(): void {
    console.warn('[Realtime] WebSocket deshabilitado temporalmente');
    return;
  }

  desconectar(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.desconectar();
  }
}
