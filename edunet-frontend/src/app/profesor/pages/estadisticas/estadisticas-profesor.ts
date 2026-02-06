import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesorService } from '../../services/profesor-service';

@Component({
  selector: 'app-estadisticas-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadisticas-profesor.html',
  styleUrls: ['./estadisticas-profesor.css']
})
export class EstadisticasProfesor implements OnInit {
  cursos: any[] = [];
  selectedCursoId: number | null = null;
  estadisticas: any = null;
  loading: boolean = false;
  error: string = '';

  constructor(private profesorService: ProfesorService) {}

  ngOnInit() {
    this.cargarCursos();
  }

  cargarCursos() {
    this.profesorService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
      },
      error: (err) => {
        console.error('Error al cargar cursos', err);
        this.error = 'No se pudieron cargar los cursos.';
      }
    });
  }

  onCursoChange() {
    if (this.selectedCursoId) {
      this.cargarEstadisticas();
    } else {
      this.estadisticas = null;
    }
  }

  cargarEstadisticas() {
    if (!this.selectedCursoId) return;

    this.loading = true;
    this.error = '';

    this.profesorService.getEstadisticasCurso(this.selectedCursoId).subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas', err);
        this.error = 'Error al cargar estadísticas del curso.';
        this.loading = false;
      }
    });
  }

  getPromedioClass(promedio: number): string {
    if (promedio >= 4.0) return 'text-green-600 font-bold';
    if (promedio >= 3.0) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  }
}
