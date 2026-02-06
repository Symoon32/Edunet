import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiantesService, Curso, Calificacion } from './services/estudiantes.service';
import { AuthStateService } from '../users/services/auth-state.service';
import { jwtDecode } from 'jwt-decode';

interface UserToken {
  id: number;
  rol: number;
  correo: string;
}

interface MateriaConNotas {
  nombre: string;
  calificaciones: Calificacion[];
  promedio: number;
}

@Component({
  selector: 'app-historial-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-estudiantes.component.html',
  styleUrls: ['./historial-estudiantes.component.css']
})
export class HistorialEstudiantesComponent implements OnInit {
  materias: MateriaConNotas[] = [];

  searchTerm: string = '';
  filterEstado: string = 'todos'; // todos, aprobado, reprobado

  userId: number | null = null;
  loading: boolean = true;

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
      console.error('Usuario no autenticado');
    }
  }

  get materiasFiltradas() {
    const term = this.searchTerm.toLowerCase().trim();
    return this.materias.filter(m => {
       const matchesSearch = (m.nombre || '').toLowerCase().includes(term);

       let matchesEstado = true;
       if (this.filterEstado === 'aprobado') {
         matchesEstado = m.promedio >= 3.0;
       } else if (this.filterEstado === 'reprobado') {
         matchesEstado = m.promedio < 3.0;
       }

       return matchesSearch && matchesEstado;
    });
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
        this.materias = [];
        let cursosProcesados = 0;

        if (cursos.length === 0) {
          this.loading = false;
          return;
        }

        cursos.forEach(curso => {
          this.estudiantesService.getCalificaciones(curso.idCurso, this.userId!).subscribe({
            next: (calificaciones) => {
              const promedio = this.calcularPromedio(calificaciones);
              this.materias.push({
                nombre: curso.materia,
                calificaciones: calificaciones,
                promedio: promedio
              });
              cursosProcesados++;
              if (cursosProcesados === cursos.length) {
                this.loading = false;
              }
            },
            error: (err) => {
              console.error(`Error al cargar calificaciones del curso ${curso.idCurso}`, err);
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

  private calcularPromedio(calificaciones: Calificacion[]): number {
    if (calificaciones.length === 0) return 0;

    let totalPeso = 0;
    let sumaPonderada = 0;

    calificaciones.forEach(c => {
      sumaPonderada += c.valor * (c.peso / 100);
      totalPeso += c.peso;
    });

    // Si los pesos no suman 100, ajustamos o asumimos que es sobre el peso acumulado
    if (totalPeso === 0) return 0;

    // Normalizar a escala de 0-5 si los pesos suman 100
    // La fórmula asume que valor es la nota y peso es el porcentaje (ej 20 para 20%)
    return Number(sumaPonderada.toFixed(2));
  }
}
