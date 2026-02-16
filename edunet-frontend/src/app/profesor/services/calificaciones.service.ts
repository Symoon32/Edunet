import { API_BASE_URL } from '../../api-config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalificacionPayload {
  idCurso: number;
  idEstudiante: number;
  tipo: string;
  nombre: string;
  valor: number;
  peso: number;
  comentarios?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalificacionesService {
  private apiUrl = `${API_BASE_URL}/calificaciones`;

  constructor(private http: HttpClient) {}

  createCalificacion(payload: CalificacionPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}`, payload);
  }

  getCalificacionesCurso(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/curso/${idCurso}`);
  }

  updateCalificacion(idCalificacion: number, data: { valor: number, comentarios: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idCalificacion}`, data);
  }

  deleteCalificacion(idCalificacion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idCalificacion}`);
  }

  getCalificacionesEstudiante(idCurso: number, idEstudiante: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/curso/${idCurso}/estudiante/${idEstudiante}`);
  }
}
