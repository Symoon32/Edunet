import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = 'http://localhost:3000/api/asistencia';

  constructor(private http: HttpClient) {}

  getAsistenciaEstudianteCurso(idEstudiante: number, idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estudiante/${idEstudiante}/curso/${idCurso}`);
  }

  getAsistenciaClase(idClase: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clase/${idClase}`);
  }

  saveAsistencia(records: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, { asistencia: records });
  }
}
