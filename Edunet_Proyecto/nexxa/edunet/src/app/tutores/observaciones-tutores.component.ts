import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutoresService } from './services/tutores.service';
import { AsistenciaService } from '../profesor/services/asistencia.service';

@Component({
  selector: 'app-inicio-observaciones-tutores',
  templateUrl: './observaciones-tutores.component.html',
  styleUrls: ['./observaciones-tutores.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ObservacionesTutoresComponent implements OnInit {
  estudiantes: any[] = [];
  estudianteSeleccionadoId: number | null = null;
  asistencias: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private tutoresService: TutoresService,
    private asistenciaService: AsistenciaService
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.loading = true;
    this.tutoresService.getMisEstudiantes().subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.loading = false;
        if (this.estudiantes.length > 0) {
           this.estudianteSeleccionadoId = this.estudiantes[0].idUsuarios;
           this.cargarAsistencia();
        }
      },
      error: (err) => {
        console.error('Error cargando estudiantes', err);
        this.error = 'No se pudieron cargar los estudiantes.';
        this.loading = false;
      }
    });
  }

  cargarAsistencia(): void {
    if (!this.estudianteSeleccionadoId) return;

    const estudiante = this.estudiantes.find(e => e.idUsuarios == this.estudianteSeleccionadoId);
    if (!estudiante) return;

    // Same fallback logic for course ID as in Grades
    const idCurso = parseInt(estudiante.curso_asignado) || 0;

    this.loading = true;
    this.error = null;
    this.asistenciaService.getAsistenciaEstudianteCurso(this.estudianteSeleccionadoId, idCurso).subscribe({
      next: (data) => {
        this.asistencias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando asistencia', err);
        this.error = 'No se pudo cargar la asistencia. Verifique que el estudiante tenga un curso asignado válido.';
        this.loading = false;
        this.asistencias = [];
      }
    });
  }

  onEstudianteChange(): void {
    this.cargarAsistencia();
  }
}
