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

  private readonly turnoActualizado$   = new Subject<TurnoActualizadoEvent>();
  private readonly usuarioActualizado$ = new Subject<UsuarioActualizadoEvent>();
  private readonly usuarioCambiado$    = new Subject<void>();

  readonly onTurnoActualizado$   = this.turnoActualizado$.asObservable();
  readonly onUsuarioActualizado$ = this.usuarioActualizado$.asObservable();
  readonly onUsuarioCambiado$    = this.usuarioCambiado$.asObservable();

  conectar(): void {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3000/eventos', {
      transports: ['websocket'],
    });

    this.socket.on('turno:actualizado', (data: TurnoActualizadoEvent) => {
      this.ngZone.run(() => this.turnoActualizado$.next(data));
    });

    this.socket.on('usuario:actualizado', (data: UsuarioActualizadoEvent) => {
      this.ngZone.run(() => this.usuarioActualizado$.next(data));
    });

    this.socket.on('usuario:cambiado', () => {
      this.ngZone.run(() => this.usuarioCambiado$.next());
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
