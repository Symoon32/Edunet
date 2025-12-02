import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstudiantesService, Calificacion } from './services/estudiantes.service';
import { AuthStateService } from '../users/services/auth-state.service';
import { jwtDecode } from 'jwt-decode';

interface UserToken {
  id: number;
}

interface Tarea {
  materia: string;
  nombre: string;
  fecha_asignacion: string;
  estado: string; // Pendiente, Calificado
  valor?: number;
}

@Component({
  selector: 'app-tareas-estudiantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tareas-estudiantes.component.html',
  styleUrls: ['./tareas-estudiantes.component.css']
})
export class TareasEstudiantesComponent implements OnInit {
  tareas: Tarea[] = [];
  loading: boolean = true;
  userId: number | null = null;

  constructor(
    private estudiantesService: EstudiantesService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.userId = this.getUserId();
    if (this.userId) {
      this.loadData();
    } else {
      this.loading = false;
    }
  }

  private getUserId(): number | null {
    const token = this.authState.snapshot.token;
    if (!token) return null;
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.id;
    } catch (e) {
      return null;
    }
  }

  private loadData() {
    this.estudiantesService.getMisCursos().subscribe({
      next: (cursos) => {
        this.tareas = [];
        let cursosProcesados = 0;

        if (cursos.length === 0) {
          this.loading = false;
          return;
        }

        cursos.forEach(curso => {
          this.estudiantesService.getCalificaciones(curso.idCurso, this.userId!).subscribe({
            next: (calificaciones) => {
              calificaciones.forEach(c => {
                // Consideramos "Tareas" o evaluaciones futuras o recientes
                // Si ya tiene valor, está "Calificado", si no (y si la API devolviera null, pero devuelve valor 0 o similar si fue creado vacio?
                // La API `createCalificacion` inserta valor. Si es una tarea pendiente de entregar, quizás no esté en calificaciones aun o tenga valor 0?
                // Asumiremos que todo item en calificaciones es una "Tarea" o evaluación.

                // Determinamos estado. Si tiene valor > 0, es calificado. Si fecha es futura, pendiente?
                // Como no tenemos campo 'entregado', usamos valor.
                const estado = (c.valor > 0) ? 'Calificado' : 'Pendiente';

                this.tareas.push({
                  materia: curso.materia,
                  nombre: c.nombre,
                  fecha_asignacion: c.fecha_asignacion,
                  estado: estado,
                  valor: c.valor
                });
              });

              cursosProcesados++;
              if (cursosProcesados === cursos.length) {
                // Ordenar por fecha desc
                this.tareas.sort((a, b) => new Date(b.fecha_asignacion).getTime() - new Date(a.fecha_asignacion).getTime());
                this.loading = false;
              }
            },
            error: (err) => {
              console.error(`Error al cargar tareas del curso ${curso.idCurso}`, err);
              cursosProcesados++;
              if (cursosProcesados === cursos.length) {
                this.loading = false;
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Error al cargar cursos', err);
        this.loading = false;
      }
    });
  }

  getBadgeClass(estado: string): string {
    if (estado === 'Calificado') return 'bg-success';
    return 'bg-warning text-dark';
  }
}
