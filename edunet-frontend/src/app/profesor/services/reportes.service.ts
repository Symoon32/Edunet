import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../api-config';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = `${API_BASE_URL}/reportes`;

  constructor(private http: HttpClient) {}

  generarReporteRendimiento(idCurso: number, body: { periodo: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/curso/${idCurso}/rendimiento`, body);
  }

  getReportesCurso(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/curso/${idCurso}`);
  }

  getReporte(idReporte: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idReporte}`);
  }

  deleteReporte(idReporte: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idReporte}`);
  }
}
