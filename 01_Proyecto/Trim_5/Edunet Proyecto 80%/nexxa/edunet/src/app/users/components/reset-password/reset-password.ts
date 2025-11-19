import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {
  password: string = '';
  mensaje: string = '';
  error: string = '';
  token: string = '';

  constructor(private route: ActivatedRoute, private userService: UserService) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  onSubmit() {
    this.mensaje = '';
    this.error = '';
    this.userService.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.mensaje = 'Contraseña restablecida correctamente.';
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al restablecer la contraseña.';
      }
    });
  }
}
