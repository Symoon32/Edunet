import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportesAdminService } from './services/reportes.service';
import { CursosAdminService } from './services/cursos.service';
import { UserService } from '../users/services/user-service';

@Component({
  selector: 'app-reportes.component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  reportType: string = '';
  reportData: any[] = [];

  // Selection lists
  profesores: any[] = [];
  cursos: any[] = [];

  // Selected IDs
  selectedProfesorId: number | null = null;
  selectedCursoId: number | null = null;
  selectedRoleId: number | null = null;

  constructor(
    private reportesService: ReportesAdminService,
    private cursosService: CursosAdminService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.userService.getUsers(2).subscribe(data => this.profesores = data);
    this.cursosService.getCursos().subscribe(data => this.cursos = data);
  }

  onReportTypeChange() {
    this.reportData = [];
    this.selectedProfesorId = null;
    this.selectedCursoId = null;
    this.selectedRoleId = null;
  }

  generateReport() {
    this.reportData = [];

    switch (this.reportType) {
      case 'usuarios':
        if (this.selectedRoleId) {
          this.reportesService.getUsersByRole(this.selectedRoleId).subscribe({
            next: (data) => this.reportData = data,
            error: (err) => alert('Error generando reporte')
          });
        }
        break;
      case 'asignaciones':
        if (this.selectedProfesorId) {
          this.reportesService.getTeacherAssignments(this.selectedProfesorId).subscribe({
            next: (data) => this.reportData = data,
            error: (err) => alert('Error generando reporte')
          });
        }
        break;
      case 'calificaciones':
        if (this.selectedCursoId) {
          this.reportesService.getGradesByCourse(this.selectedCursoId).subscribe({
            next: (data) => this.reportData = data,
            error: (err) => alert('Error generando reporte')
          });
        }
        break;
      case 'log':
        this.reportesService.getActivityLog().subscribe({
          next: (data) => this.reportData = data,
          error: (err) => alert('Error generando reporte')
        });
        break;
    }
  }

  exportReport() {
    alert('Función de exportar a PDF/Excel pendiente de implementar (requiere librerías externas).');
  }
}
