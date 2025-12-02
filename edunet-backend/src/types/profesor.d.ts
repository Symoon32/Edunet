export interface Profesor {
  idUsuarios: number;
  nombre: string;
  apellido: string;
  email: string;
  foto?: string;
  especialidad?: string;
  titulo?: string;
}

export interface ProfesorDashboard {
  proximasClases: any[];
  cursosActivos: number;
  estudiantesTotales: number;
  proximasEntregas: any[];
}