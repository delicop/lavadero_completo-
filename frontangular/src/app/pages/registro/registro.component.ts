import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  // Datos del lavadero
  nombreTenant = '';
  slug         = '';

  // Datos del admin
  nombre   = '';
  apellido = '';
  email    = '';
  password = '';

  cargando = false;
  error    = '';

  // Genera el slug automáticamente desde el nombre del lavadero
  generarSlug(): void {
    this.slug = this.nombreTenant
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // quita tildes
      .replace(/[^a-z0-9\s-]/g, '')      // solo letras, números y guiones
      .trim()
      .replace(/\s+/g, '-');             // espacios → guión
  }

  async submit(): Promise<void> {
    this.error    = '';
    this.cargando = true;
    try {
      await this.auth.registrar({
        nombreTenant: this.nombreTenant,
        slug:         this.slug,
        nombre:       this.nombre,
        apellido:     this.apellido,
        email:        this.email,
        password:     this.password,
      });
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Error al registrar el lavadero';
    } finally {
      this.cargando = false;
    }
  }
}
