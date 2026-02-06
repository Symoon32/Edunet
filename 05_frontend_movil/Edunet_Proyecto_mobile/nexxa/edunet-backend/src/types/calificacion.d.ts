export interface Calificacion {
  idCalificacion: number;
  idCurso: number;
  idEstudiante: number;
  tipo: string;
  nombre: string;
  valor: number;
  peso: number;
  fecha_asignacion: Date;
  fecha_entrega?: Date;
  comentarios?: string;
}

export interface CalificacionDetalle extends Calificacion {
  estudiante?: {
    nombre: string;
    apellido: string;
  };
  curso?: {
    materia: string;
    grado: string;
    seccion: string;
  };
}