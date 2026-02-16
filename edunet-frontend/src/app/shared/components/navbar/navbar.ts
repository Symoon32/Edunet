import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../users/services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnDestroy {
  profileImgUrl: string = '';
  userName: string = '';
  userEmail: string = '';
  isAdmin = false;
  isProfesor = false;
  isEstudiante = false;
  isAcudiente = false;
  private sub?: Subscription;
  constructor(private router: Router, private authState: AuthStateService) {
    // Suscribirse al estado de autenticación
    this.sub = this.authState.authState$.subscribe(s => {
      this.isAdmin = s.role === 4;
      this.isProfesor = s.role === 2;
      this.isEstudiante = s.role === 1;
      this.isAcudiente = s.role === 3;
      this.updateUserInfo(s.user);
    });
  }

  private updateUserInfo(user: any) {
    if (user) {
      this.userName = user.nombres || '';
      this.userEmail = user.correo || '';
      if (user.fotoPerfil) {
        this.profileImgUrl = user.fotoPerfil.startsWith('http')
          ? user.fotoPerfil
          : `${window.location.protocol}//${window.location.hostname}:3000${user.fotoPerfil}`;
      } else {
        this.profileImgUrl = '';
      }
    } else {
      this.userName = '';
      this.userEmail = '';
      this.profileImgUrl = '';
    }
  }

  logout() {
    this.authState.clear();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

}
