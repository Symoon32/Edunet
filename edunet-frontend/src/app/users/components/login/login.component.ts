import { Component } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth-service';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgbCarouselModule, RouterModule]
})
export class LoginComponent {
  correo: string = '';
  password: string = '';
  rol: number | null = null;
  errorMessage: string = '';
  showPassword: boolean = false;


  constructor(private router: Router, private authService: AuthService, private authState: AuthStateService) {
    // cargar estado inicial desde localStorage
    this.authState.loadFromStorage();
  }

  login() {
    this.authService.login(this.correo, this.password).subscribe({
      next: (res: AuthResponse) => {
        this.rol = res.rol;
        this.errorMessage = '';

        // Extraer info del usuario del token
        let user = null;
        try {
          const payload = JSON.parse(atob(res.token.split('.')[1]));
          user = {
            id: payload.id,
            correo: payload.correo,
            nombres: payload.nombres || payload.correo.split('@')[0],
            fotoPerfil: payload.fotoPerfil,
            is_rector: payload.is_rector
          };
        } catch (e) {
          console.error('Error decoding token', e);
        }

        // Usar AuthStateService para propagar el estado de autenticación
        this.authState.setAuth(res.token, res.rol, user);

        let rolNombre = '';
        let ruta = '';
        switch (res.rol) {
          case 1:
            rolNombre = 'Estudiante';
            ruta = '/estudiantes';
            break;
          case 2:
            rolNombre = 'Profesor';
            ruta = '/profesor';
            break;
          case 3:
            rolNombre = 'Acudiente';
            ruta = '/tutores';
            break;
          case 4:
            rolNombre = 'Administrador';
            ruta = '/admin/inicio';
            break;
        }
        
        this.router.navigate([ruta]);
      },
      error: (err) => {
        this.rol = null;
        if (err.status === 403) {
          this.errorMessage = err.error?.error || 'Usuario inactivado';
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos';
        }
      }
    });
  }
}
