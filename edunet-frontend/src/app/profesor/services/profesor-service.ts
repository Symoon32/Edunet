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

  // ⚠️ MOCK METHODS FOR BUILD COMPATIBILITY ⚠️
  // These methods are temporarily added to satisfy build requirements for shared components.
  // Real implementation should be added when the Professor module is fully updated.

  getProfesorById(id: number | string): Observable<any> {
    return of({}); // Mock
  }

  updateProfesor(id: number | string, data: any): Observable<any> {
    return of({}); // Mock
  }

  createProfesor(data: any): Observable<any> {
    return of({}); // Mock
  }

  uploadProfilePhoto(formData: FormData): Observable<any> {
    return of({}); // Mock
  }

  getProfesores(): Observable<any[]> {
    return of([]); // Mock
  }

  deleteProfesor(id: number | string): Observable<any> {
    return of({}); // Mock
  }
}
