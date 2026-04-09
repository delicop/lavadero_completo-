import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LiquidacionService } from '../../core/services/liquidacion.service';
import { SesionService } from '../../core/services/sesion.service';
import { formatPrecio } from '../../shared/utils/formatters';
import type { Liquidacion, Usuario } from '../../shared/types';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
})
export class MiPerfilComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly sesion = inject(SesionService);
  private readonly liquidacionSvc = inject(LiquidacionService);
  readonly formatPrecio = formatPrecio;

  usuario: Usuario | null = null;
  liquidaciones: Liquidacion[] = [];

  pwdActual = '';
  pwdNueva = '';
  pwdConfirmar = '';
  guardandoPwd = false;
  msgPwd = '';
  msgPwdTipo: 'ok' | 'error' = 'ok';

  get iniciales(): string {
    if (!this.usuario) return '?';
    return `${this.usuario.nombre.charAt(0)}${this.usuario.apellido.charAt(0)}`.toUpperCase();
  }

  async ngOnInit(): Promise<void> {
    this.usuario = this.sesion.obtener();
    try {
      this.liquidaciones = await this.liquidacionSvc.mias();
    } catch {
      // sin liquidaciones
    }
  }

  async cambiarPassword(): Promise<void> {
    this.msgPwd = '';
    if (this.pwdNueva !== this.pwdConfirmar) {
      this.msgPwd = 'Las contraseñas nuevas no coinciden';
      this.msgPwdTipo = 'error';
      return;
    }
    this.guardandoPwd = true;
    try {
      await this.auth.cambiarPassword(this.pwdActual, this.pwdNueva);
      this.msgPwd = 'Contraseña cambiada correctamente';
      this.msgPwdTipo = 'ok';
      this.pwdActual = this.pwdNueva = this.pwdConfirmar = '';
    } catch {
      this.msgPwd = 'Contraseña actual incorrecta';
      this.msgPwdTipo = 'error';
    } finally {
      this.guardandoPwd = false;
    }
  }

  fechaCorta(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
