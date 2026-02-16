import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  correo: string = '';
  mensaje: string = '';
  error: string = '';

  constructor(private userService: UserService) {}

  onSubmit() {
    this.mensaje = '';
    this.error = '';
    this.userService.forgotPassword(this.correo).subscribe({
      next: (res) => {
        this.mensaje = 'Revisa tu correo para el enlace de recuperación.';
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al enviar el correo.';
      }
    });
  }
}
