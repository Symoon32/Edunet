import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../users/services/user-service';

@Component({
  selector: 'app-tutor-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './tutor-layout.component.html',
  styleUrls: ['./tutor-layout.component.css']
})
export class TutorLayoutComponent {
  private router = inject(Router);
  private userService = inject(UserService);

  sidebarOpen = true;
  currentUser: any = null;

  constructor() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    // Clear token and user data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}
