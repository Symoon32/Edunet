export interface Curso {
  idCurso: number;
  idMateria: number;
  idProfesor: number;
  periodo: string;
  anio: number;
  grado: string;
  seccion: string;
  materia?: {
    nombre: string;
    codigo: string;
    descripcion?: string;
  };
}

export interface Materia {
  idMateria: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
}

export interface CursoEstudiante {
  idCurso: number;
  idEstudiante: number;
  fechaInscripcion: Date;
  estado: 'activo' | 'inactivo' | 'retirado';
}