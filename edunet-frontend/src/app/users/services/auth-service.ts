import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  token: string;
  rol: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // El backend monta las rutas de auth en '/api' y el login está en '/api/login'
  private apiUrl = 'http://localhost:3000/api/auth/login'; // Ajustado al backend

  constructor(private http: HttpClient) {}

  login(correo: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { correo, password });
  }
}
