import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  token: string;
  rol: number;
}

import { API_BASE_URL } from '../../api-config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${API_BASE_URL}/auth/login`;

  constructor(private http: HttpClient) {}

  login(correo: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { correo, password });
  }
}
