import { API_BASE_URL } from '../../api-config';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesAdminService {
  private apiUrl = `${API_BASE_URL}/admin/reportes`;
  private http = inject(HttpClient);

  getUsersByRole(idRol: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users-by-role/${idRol}`);
  }

  getTeacherAssignments(idProfesor: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/teacher-assignments/${idProfesor}`);
  }

  getCourseEnrollments(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/course-enrollments/${idCurso}`);
  }

  getGradesByCourse(idCurso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/grades-by-course/${idCurso}`);
  }

  getActivityLog(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activity-log`);
  }
}
