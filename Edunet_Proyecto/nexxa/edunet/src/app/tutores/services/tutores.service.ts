import { environment } from "@env/environment";
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutoresService {
  private apiUrl = environment.apiUrl + '/api/users'; // Base URL for users

  constructor(private http: HttpClient) {}

  getMisEstudiantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-estudiantes/list`);
  }
}
