import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutoresService {
  private apiUrl = 'http://localhost:3000/api/users'; // Base URL for users

  constructor(private http: HttpClient) {}

  getMisEstudiantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-estudiantes/list`);
  }
}
