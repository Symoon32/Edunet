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

    const token = localStorage.getItem('auth_token');
    if (token) {
       try {
           const payload = JSON.parse(atob(token.split('.')[1]));
           // Just displaying basic info, for full profile we might need to fetch user
           // For now, use payload data or placeholder
           this.currentUser = {
               nombres: payload.correo.split('@')[0], // Placeholder
               fotoPerfil: 'assets/default-avatar.png',
               rol: 'Profesor'
           };
       } catch (e) {
           console.error(e);
       }
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/']);
  }
}
