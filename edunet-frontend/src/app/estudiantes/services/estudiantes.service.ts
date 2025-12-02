import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Curso {
  idCurso: number;
  idMateria: number;
  materia: string; // Nombre de la materia
  codigo: string;
  nombreProfesor: string;
  apellidosProfesor: string;
  estado: string;
  fechaInscripcion: string;
  periodo: string;
  anio: number;
}

export interface Calificacion {
  idCalificacion: number;
  idCurso: number;
  tipo: string;
  nombre: string;
  valor: number;
  peso: number;
  fecha_asignacion: string;
  comentarios: string;
}

export interface Material {
  idMaterial: number;
  idCurso: number;
  titulo: string;
  descripcion: string;
  url_archivo: string;
  tipo: string;
  fecha_publicacion: string;
}

export interface Evento {
  idEvento: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {
  private apiUrl = 'http://localhost:3000/api'; // Base URL - should be environment configurable but hardcoded for now as per memory

  constructor(private http: HttpClient) {}

  // Cursos y Profesores asignados
  getMisCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}/estudiantes/cursos`);
  }

  // Calificaciones
  getCalificaciones(idCurso: number, idEstudiante: number): Observable<Calificacion[]> {
    return this.http.get<Calificacion[]>(`${this.apiUrl}/calificaciones/curso/${idCurso}/estudiante/${idEstudiante}`);
  }

  // Materiales de estudio
  getMateriales(idCurso: number): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/materiales/curso/${idCurso}`);
  }

  // Calendario Académico (Eventos)
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos`);
  }
}
