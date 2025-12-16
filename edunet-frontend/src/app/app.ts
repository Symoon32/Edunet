import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { AuthStateService } from './users/services/auth-state.service';
import { Footer } from './shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'edunet';

  constructor(private router: Router, private authState: AuthStateService) {
    // Cargar estado de autenticación desde localStorage al iniciar la app
    this.authState.loadFromStorage();
  }

  esLogin(): boolean {
    return this.router.url === '/';
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin') ||
           this.router.url.startsWith('/profesor') ||
           this.router.url.startsWith('/tutores') ||
           this.router.url.startsWith('/estudiantes');
  }
}
