import { environment } from "@env/environment";
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = environment.apiUrl + '/api/eventos';
  private http = inject(HttpClient);

  getEventos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createEvento(evento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, evento);
  }

  updateEvento(idEvento: number, evento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idEvento}`, evento);
  }

  deleteEvento(idEvento: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${idEvento}`);
  }
}
