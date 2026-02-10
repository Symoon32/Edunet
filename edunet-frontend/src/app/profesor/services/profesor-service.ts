import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {
  private apiUrl = 'http://localhost:3000/api/profesor'; // URL base del backend

  constructor(private http: HttpClient) {}

  // 📊 Obtener datos del Dashboard
  getDashboard(idProfesor: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/${idProfesor}`);
  }

  // 🧑‍🏫 Obtener perfil del profesor
  getPerfil(idProfesor: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil/${idProfesor}`);
  }

  // ✏️ Actualizar perfil
  updatePerfil(idProfesor: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil/${idProfesor}`, datos);
  }

  // 📅 Obtener horario de clases
  getHorario(idProfesor: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/horario/${idProfesor}`);
  }

  // 📚 Obtener cursos del profesor
  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cursos`);
  }

  // 👥 Obtener estudiantes de un curso
  getEstudiantes(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cursos/${idCurso}/estudiantes`);
  }

  // 📊 Obtener estadísticas de un curso
  getEstadisticasCurso(idCurso: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas/curso/${idCurso}`);
  }

  // 📄 Obtener reporte detallado de un curso
  getReporteCurso(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/curso/${idCurso}`);
  }

  // 📄 Obtener reporte individual de estudiante
  getReporteEstudiante(idEstudiante: number, idCurso: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reportes/estudiante/${idEstudiante}/curso/${idCurso}`);
  }

  // 🧑‍🏫 Professor management methods (connected to /api/users)
  // These are often used by admin views or specific professor lists

  getProfesorById(id: number | string): Observable<any> {
    const baseApi = this.apiUrl.replace('/profesor', '');
    return this.http.get(`${baseApi}/users/id/${id}`);
  }

  updateProfesor(id: number | string, data: any): Observable<any> {
    const baseApi = this.apiUrl.replace('/profesor', '');
    // If we have correo, we use the standard updateUser route
    if (data.correo) {
      return this.http.put(`${baseApi}/users/${data.correo}`, data);
    }
    return of({ error: 'Correo is required for update' });
  }

  createProfesor(data: any): Observable<any> {
    const baseApi = this.apiUrl.replace('/profesor', '');
    const professorData = { ...data, rol: 2 }; // Ensure role is professor
    return this.http.post(`${baseApi}/users`, professorData);
  }

  uploadProfilePhoto(formData: FormData): Observable<any> {
    const baseApi = this.apiUrl.replace('/profesor', '');
    return this.http.post<any>(`${baseApi}/users/upload-profile`, formData);
  }

  getProfesores(): Observable<any[]> {
    const baseApi = this.apiUrl.replace('/profesor', '');
    return this.http.get<any[]>(`${baseApi}/users?rol=2`);
  }

  deleteProfesor(id: number | string): Observable<any> {
    const baseApi = this.apiUrl.replace('/profesor', '');
    return this.http.delete(`${baseApi}/users/id/${id}`);
  }
}
