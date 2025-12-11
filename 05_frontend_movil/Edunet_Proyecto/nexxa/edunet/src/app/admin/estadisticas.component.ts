import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursosAdminService } from './services/cursos.service';
import { ReportesAdminService } from './services/reportes.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  cursosService = inject(CursosAdminService);
  reportesService = inject(ReportesAdminService);

  cursos: any[] = [];
  selectedCursoId: number | null = null;

  estadisticas: any = null;
  loading = false;
  promedioGeneral = 0;

  ngOnInit() {
    this.cargarCursos();
  }

  cargarCursos() {
    this.cursosService.getCursos().subscribe(data => {
      this.cursos = data;
    });
  }

  generarInforme() {
    if (!this.selectedCursoId) return;

    this.loading = true;
    this.reportesService.getGradesByCourse(this.selectedCursoId).subscribe({
      next: (data) => {
        this.procesarEstadisticas(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas', err);
        this.loading = false;
      }
    });
  }

  procesarEstadisticas(data: any[]) {
    // Data expected: { nombres, apellidos, materia, valor (grade), tipo }
    // Group by student to calculate averages
    const estudiantesMap = new Map<string, { nombre: string, notas: number[] }>();
    let totalNotas = 0;
    let cantidadNotas = 0;

    data.forEach(item => {
      const key = `${item.nombres} ${item.apellidos}`;
      if (!estudiantesMap.has(key)) {
        estudiantesMap.set(key, { nombre: key, notas: [] });
      }
      const nota = parseFloat(item.valor);
      if (!isNaN(nota)) {
        estudiantesMap.get(key)!.notas.push(nota);
        totalNotas += nota;
        cantidadNotas++;
      }
    });

    const estudiantes = Array.from(estudiantesMap.values()).map(est => ({
      nombre: est.nombre,
      promedio: est.notas.length > 0
        ? (est.notas.reduce((a, b) => a + b, 0) / est.notas.length).toFixed(1)
        : 'N/A',
      cantidadEvaluaciones: est.notas.length
    }));

    this.promedioGeneral = cantidadNotas > 0 ? parseFloat((totalNotas / cantidadNotas).toFixed(2)) : 0;

    this.estadisticas = {
      estudiantes,
      totalEstudiantes: estudiantes.length,
      mejorPromedio: estudiantes.reduce((prev, current) => {
         const pCurr = parseFloat(current.promedio as string) || 0;
         const pPrev = parseFloat(prev.promedio as string) || 0;
         return pCurr > pPrev ? current : prev;
      }, { nombre: '-', promedio: '0' })
    };
  }

  getPromedioColor(promedio: number): string {
    if (promedio >= 4.0) return 'text-success';
    if (promedio >= 3.0) return 'text-warning';
    return 'text-danger';
  }
}
