import { API_BASE_URL } from '../../api-config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {
  private apiUrl = `${API_BASE_URL}/materiales`;

  constructor(private http: HttpClient) {}

  getMaterialesCurso(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/curso/${idCurso}`);
  }

  createMaterial(material: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, material);
  }

  deleteMaterial(idMaterial: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${idMaterial}`);
  }
}
