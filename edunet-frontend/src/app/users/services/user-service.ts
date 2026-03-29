
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api-config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_BASE_URL}/users`;
  private authUrl = `${API_BASE_URL}/auth`;
  private http = inject(HttpClient);

  getUsers(role: number | null = null): Observable<any> {
    let url = this.apiUrl;
    if (role) {
      url += `?rol=${role}`;
    }
    return this.http.get(url);
  }

  getUserByCorreo(correo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${correo}`);
  }

  createUser(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  updateUser(correo: string, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${correo}`, usuario);
  }

  deleteUser(correo: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${correo}`);
  }

  inactivateUser(correo: string): Observable<any> {
    // Backend handles DELETE as inactivation
    return this.http.delete(`${this.apiUrl}/${correo}`);
  }

  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, { correo, password });
  }

  forgotPassword(correo: string): Observable<any> {
    return this.http.post(`${this.authUrl}/forgot-password`, { correo });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.authUrl}/reset-password`, { token, password });
  }
  uploadProfilePhoto(formData: FormData) {
    return this.http.post<any>(`${this.apiUrl}/upload-profile`, formData);
  }

}
