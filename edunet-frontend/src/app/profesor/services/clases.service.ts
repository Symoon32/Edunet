import { API_BASE_URL } from '../../api-config';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClasesService {
  private apiUrl = `${API_BASE_URL}/clases`;
  private http = inject(HttpClient);

  getClasesCurso(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/curso/${idCurso}`);
  }

  getClase(idClase: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idClase}`);
  }
}
