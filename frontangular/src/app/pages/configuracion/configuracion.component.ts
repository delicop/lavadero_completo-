import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UsuarioService } from '../../core/services/usuario.service';
import { RealtimeService } from '../../core/services/realtime.service';
import type { Usuario, RolUsuario } from '../../shared/types';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './configuracion.component.html',
})
export class ConfiguracionComponent implements OnInit, OnDestroy {
  private readonly svc      = inject(UsuarioService);
  private readonly realtime = inject(RealtimeService);

  private sub: Subscription | null = null;

  usuarios: Usuario[] = [];
  cargando = true;
  mostrarForm = false;
  editandoId: string | null = null;
  errorForm = '';

  form = {
    nombre: '', apellido: '', email: '',
    password: '', rol: 'trabajador' as RolUsuario,
    comisionPorcentaje: 50,
  };

  get esAdmin(): boolean { return this.form.rol === 'admin'; }

  async ngOnInit(): Promise<void> {
    await this.cargar();
    this.sub = this.realtime.onUsuarioCambiado$.subscribe(() => this.cargar());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async cargar(): Promise<void> {
    this.usuarios = await this.svc.listar();
    this.cargando = false;
  }

  abrirNuevo(): void {
    this.editandoId = null;
    this.form = { nombre: '', apellido: '', email: '', password: '', rol: 'trabajador', comisionPorcentaje: 50 };
    this.errorForm = '';
    this.mostrarForm = true;
  }

  abrirEditar(u: Usuario): void {
    this.editandoId = u.id;
    this.form = {
      nombre: u.nombre, apellido: u.apellido, email: u.email,
      password: '', rol: u.rol, comisionPorcentaje: u.comisionPorcentaje,
    };
    this.errorForm = '';
    this.mostrarForm = true;
  }

  cerrarForm(): void {
    this.mostrarForm = false;
    this.editandoId = null;
  }

  async guardar(): Promise<void> {
    this.errorForm = '';
    try {
      if (this.editandoId) {
        const payload: Record<string, unknown> = {
          nombre: this.form.nombre,
          apellido: this.form.apellido,
          rol: this.form.rol,
        };
        if (!this.esAdmin) payload['comisionPorcentaje'] = this.form.comisionPorcentaje;
        if (this.form.password) payload['password'] = this.form.password;
        await this.svc.actualizar(this.editandoId, payload);
      } else {
        const payload: Record<string, unknown> = {
          nombre: this.form.nombre,
          apellido: this.form.apellido,
          email: this.form.email,
          password: this.form.password,
          rol: this.form.rol,
        };
        if (!this.esAdmin) payload['comisionPorcentaje'] = this.form.comisionPorcentaje;
        await this.svc.crear(payload);
      }
      this.cerrarForm();
      // El WebSocket onUsuarioCambiado$ recarga automáticamente
    } catch (err) {
      this.errorForm = err instanceof Error ? err.message : 'Error al guardar';
    }
  }

  async toggleActivo(u: Usuario): Promise<void> {
    await this.svc.actualizar(u.id, { activo: !u.activo });
    // El WebSocket onUsuarioCambiado$ recarga automáticamente
  }
}
