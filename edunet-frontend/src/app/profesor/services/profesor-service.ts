import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfesorService {
  
  private apiUrl = 'http://localhost:3000/api/users';
  private http = inject(HttpClient);

  getProfesores(): Observable<any> { return this.http.get(this.apiUrl); }
  getProfesorById(id: string): Observable<any> { return this.http.get(`${this.apiUrl}/${id}`); }
  createProfesor(profesor: any): Observable<any> { return this.http.post(this.apiUrl, profesor); }
  updateProfesor(id: string, profesor: any): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, profesor); }
  deleteProfesor(id: string): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
  uploadProfilePhoto(formData: FormData) { return this.http.post<any>(`${this.apiUrl}/upload-profile`, formData); }
}
