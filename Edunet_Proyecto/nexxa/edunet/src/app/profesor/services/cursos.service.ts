import { environment } from "@env/environment";
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CursosService {
  private apiUrl = environment.apiUrl + '/api/cursos';
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
