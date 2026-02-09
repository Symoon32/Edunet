import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../users/services/user-service';

@Component({
  selector: 'app-profesor-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './profesor-layout.component.html',
  styleUrls: ['./profesor-layout.component.css']
})
export class ProfesorLayoutComponent {
  private router = inject(Router);

  sidebarOpen = true;
  currentUser: any = null;

  constructor() {
    // Check if screen is small to default sidebar to closed
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }

    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    } else {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.currentUser = {
            nombres: payload.correo.split('@')[0],
            fotoPerfil: 'assets/default-avatar.png',
            rol: 'Profesor'
          };
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}
