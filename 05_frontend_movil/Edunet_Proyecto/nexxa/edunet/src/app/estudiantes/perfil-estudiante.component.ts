import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../users/services/auth-state.service';
import { UserService } from '../users/services/user-service';
import { jwtDecode } from 'jwt-decode';

interface UserToken {
  id: number;
}

@Component({
  selector: 'app-perfil-estudiante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-estudiante.component.html',
  styleUrls: ['./perfil-estudiante.component.css']
})
export class PerfilEstudianteComponent implements OnInit {
  usuario: any = null;
  loading: boolean = true;

  constructor(
    private authState: AuthStateService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const token = this.authState.snapshot.token;
    if (token) {
      try {
        const decoded = jwtDecode<UserToken>(token);
        // We fetch the full user details using the ID from the token
        // Assuming UserService has a method to get user by ID or we use the cached user if available
        // But cached user in localStorage might be incomplete. Let's try to fetch fresh if possible,
        // or fall back to localStorage 'user'

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.usuario = JSON.parse(storedUser);
            this.loading = false;
        } else {
            // Fallback if no stored user (shouldn't happen if logged in)
             this.loading = false;
        }

      } catch (e) {
        console.error('Error decoding token', e);
        this.loading = false;
      }
    } else {
        this.loading = false;
    }
  }
}
