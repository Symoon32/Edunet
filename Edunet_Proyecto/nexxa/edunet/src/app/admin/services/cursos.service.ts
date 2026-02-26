import { environment } from "@env/environment";
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CursosAdminService {
  private apiUrl = environment.apiUrl + '/api/cursos';
  private http = inject(HttpClient);

  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createCurso(curso: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, curso);
  }

  updateCurso(idCurso: number, curso: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idCurso}`, curso);
  }

  deleteCurso(idCurso: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${idCurso}`);
  }

  assignStudentToCurso(idCurso: number, idEstudiante: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idCurso}/admin/assign-student`, { idCurso, idEstudiante });
  }

  assignProfesorToCurso(idCurso: number, idProfesor: number, idMateria: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/assign-profesor`, { idCurso, idProfesor, idMateria });
  }
}
