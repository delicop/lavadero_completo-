import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  cargando = false;
  error = '';

  async submit(): Promise<void> {
    this.error = '';
    this.cargando = true;
    try {
      await this.auth.login({ email: this.email, password: this.password });
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Error al iniciar sesión';
    } finally {
      this.cargando = false;
    }
  }
}
