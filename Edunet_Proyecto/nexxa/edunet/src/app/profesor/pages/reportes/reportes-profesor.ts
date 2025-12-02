import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesorService } from '../../services/profesor-service';

@Component({
  selector: 'app-reportes-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-profesor.html',
  styleUrls: ['./reportes-profesor.css']
})
export class ReportesProfesor implements OnInit {
  cursos: any[] = [];
  estudiantes: any[] = [];

  selectedCursoId: number | null = null;
  selectedEstudianteId: number | null = null;

  reporteData: any = null;
  tipoReporteActual: 'curso' | 'estudiante' | null = null;

  loading: boolean = false;
  error: string = '';

  constructor(private profesorService: ProfesorService) {}

  ngOnInit() {
    this.cargarCursos();
  }

  cargarCursos() {
    this.profesorService.getCursos().subscribe({
      next: (data) => this.cursos = data,
      error: (err) => console.error(err)
    });
  }

  onCursoChange() {
    this.selectedEstudianteId = null;
    this.estudiantes = [];
    this.reporteData = null;
    this.tipoReporteActual = null;

    if (this.selectedCursoId) {
      this.profesorService.getEstudiantes(this.selectedCursoId).subscribe({
        next: (data) => this.estudiantes = data,
        error: (err) => console.error(err)
      });
    }
  }

  generarReporteCurso() {
    if (!this.selectedCursoId) return;

    this.loading = true;
    this.error = '';
    this.tipoReporteActual = 'curso';
    this.reporteData = null;

    this.profesorService.getReporteCurso(this.selectedCursoId).subscribe({
      next: (data) => {
        this.reporteData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al generar reporte del curso';
        this.loading = false;
      }
    });
  }

  generarReporteEstudiante() {
    if (!this.selectedCursoId || !this.selectedEstudianteId) return;

    this.loading = true;
    this.error = '';
    this.tipoReporteActual = 'estudiante';
    this.reporteData = null;

    this.profesorService.getReporteEstudiante(this.selectedEstudianteId, this.selectedCursoId).subscribe({
      next: (data) => {
        this.reporteData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al generar reporte del estudiante';
        this.loading = false;
      }
    });
  }
}
