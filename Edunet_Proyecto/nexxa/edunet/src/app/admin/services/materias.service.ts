import { environment } from "@env/environment";
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MateriasAdminService {
  private apiUrl = environment.apiUrl + '/api/materias';
  private http = inject(HttpClient);

  getMaterias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createMateria(materia: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, materia);
  }

  updateMateria(id: number, materia: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, materia);
  }

  deleteMateria(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
