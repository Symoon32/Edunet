import { API_BASE_URL } from '../../api-config';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CursosService {
  private apiUrl = `${API_BASE_URL}/cursos`;
  private http = inject(HttpClient);

  getCursosProfesor(idProfesor: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/profesor/${idProfesor}`);
  }

  getCurso(idCurso: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idCurso}`);
  }

  getEstudiantesCurso(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idCurso}/estudiantes`);
  }
}
