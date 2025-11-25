import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfesorService {
  
  // URL for Admin management of professors (crud)
  private apiUsersUrl = 'http://localhost:3000/api/users';
  // URL for Professor specific actions (dashboard, courses)
  private apiProfesorUrl = 'http://localhost:3000/api/profesor';
  private apiClasesUrl = 'http://localhost:3000/api/clases';

  private http = inject(HttpClient);

  // --- Admin Methods (Restored) ---
  getProfesores(): Observable<any> { return this.http.get(this.apiUsersUrl); }
  getProfesorById(id: string): Observable<any> { return this.http.get(`${this.apiUsersUrl}/${id}`); }
  createProfesor(profesor: any): Observable<any> { return this.http.post(this.apiUsersUrl, profesor); }
  updateProfesor(id: string, profesor: any): Observable<any> { return this.http.put(`${this.apiUsersUrl}/${id}`, profesor); }
  deleteProfesor(id: string): Observable<any> { return this.http.delete(`${this.apiUsersUrl}/${id}`); }
  uploadProfilePhoto(formData: FormData) { return this.http.post<any>(`${this.apiUsersUrl}/upload-profile`, formData); }

  // --- Professor Dashboard Methods (New) ---
  getDashboard(id: number): Observable<any> { return this.http.get(`${this.apiProfesorUrl}/dashboard/${id}`); }
  getPerfil(id: number): Observable<any> { return this.http.get(`${this.apiProfesorUrl}/perfil/${id}`); }
  updatePerfil(id: number, data: any): Observable<any> { return this.http.put(`${this.apiProfesorUrl}/perfil/${id}`, data); }
  getHorario(id: number): Observable<any> { return this.http.get(`${this.apiProfesorUrl}/horario/${id}`); }

  // --- Cursos y Clases ---
  getCursos(id: number): Observable<any> { return this.http.get(`${this.apiProfesorUrl}/cursos/${id}`); }
  getClasesPorCurso(idCurso: number): Observable<any> { return this.http.get(`${this.apiClasesUrl}/curso/${idCurso}`); }
}
