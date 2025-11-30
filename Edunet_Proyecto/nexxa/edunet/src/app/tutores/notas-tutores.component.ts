import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutoresService } from './services/tutores.service';
import { CalificacionesService } from '../profesor/services/calificaciones.service';

@Component({
  selector: 'app-inicio-notas-tutores',
  templateUrl: './notas-tutores.component.html',
  styleUrls: ['./notas-tutores.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class NotasTutoresComponent implements OnInit {
  estudiantes: any[] = [];
  estudianteSeleccionadoId: number | null = null;
  calificaciones: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Asumimos que los estudiantes tienen un curso asignado.
  // En una implementación real, quizás necesitemos saber el ID del curso de otra forma.
  // Por ahora, usaremos el 'curso_asignado' del estudiante si es un ID,
  // o tendremos que buscarlo. El backend de calificaciones requiere idCurso.
  // La respuesta de getUsers incluye 'curso_asignado'. Asumiremos que es el ID o un string parsable.
  // Si es solo nombre, necesitaremos el ID.
  // Revisando usersController, 'curso_asignado' es un campo.

  constructor(
    private tutoresService: TutoresService,
    private calificacionesService: CalificacionesService
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
           this.cargarCalificaciones();
        }
      },
      error: (err) => {
        console.error('Error cargando estudiantes', err);
        this.error = 'No se pudieron cargar los estudiantes.';
        this.loading = false;
      }
    });
  }

  cargarCalificaciones(): void {
    if (!this.estudianteSeleccionadoId) return;

    const estudiante = this.estudiantes.find(e => e.idUsuarios == this.estudianteSeleccionadoId);
    if (!estudiante) return;

    // Aquí hay un problema: necesitamos el idCurso.
    // El estudiante tiene 'curso_asignado', pero a veces es un string (nombre del curso) o un ID.
    // Si la API de calificaciones requiere idCurso, necesitamos ese ID.
    // Vamos a intentar parsearlo si es numérico, o 0 si no.
    // NOTA: Si el backend de usuarios devuelve el ID en 'curso_asignado', perfecto.
    // Si no, necesitaremos ajustar la lógica. Asumiremos por ahora que tenemos acceso al ID de alguna forma.
    // En la tabla usuarios, 'curso_asignado' es varchar?

    // Fallback: Si no tenemos idCurso, no podemos consultar calificaciones por curso.
    // Pero la ruta es /curso/:idCurso/estudiante/:idEstudiante.
    // Intentaremos usar el campo tal cual.

    const idCurso = parseInt(estudiante.curso_asignado) || 0; // Ajustar según datos reales

    this.loading = true;
    this.error = null;
    this.calificacionesService.getCalificacionesEstudiante(idCurso, this.estudianteSeleccionadoId).subscribe({
      next: (data) => {
        this.calificaciones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando calificaciones', err);
        this.error = 'No se pudieron cargar las calificaciones. Verifique que el estudiante tenga un curso asignado válido.';
        this.loading = false;
        this.calificaciones = [];
      }
    });
  }

  onEstudianteChange(): void {
    this.cargarCalificaciones();
  }
}
