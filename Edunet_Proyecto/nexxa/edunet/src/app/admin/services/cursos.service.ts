import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CursosAdminService {
  private apiUrl = 'http://localhost:3000/api/cursos';
  private http = inject(HttpClient);

  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  assignStudentToCurso(idCurso: number, idEstudiante: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/:idCurso/admin/assign-student`, { idCurso, idEstudiante });
  }

  assignProfesorToCurso(idCurso: number, idProfesor: number, idMateria: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/assign-profesor`, { idCurso, idProfesor, idMateria });
  }
}
