import { Component } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth-service';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgbCarouselModule]
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
        // Usar AuthStateService para propagar el estado de autenticación
        this.authState.setAuth(res.token, res.rol);
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
      error: () => {
        this.rol = null;
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }
}
