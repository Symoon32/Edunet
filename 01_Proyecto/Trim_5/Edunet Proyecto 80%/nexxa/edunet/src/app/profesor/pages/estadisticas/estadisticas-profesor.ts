import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Rendimiento {
  nombre: string;
  curso: string;
  materia: string;
  promedio: number;
  estado: string;
}

interface Asistencia {
  nombre: string;
  curso: string;
  asistidos: number;
  ausentes: number;
}

@Component({
  selector: 'app-estadisticas-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadisticas-profesor.html',
  styleUrls: ['./estadisticas-profesor.css']
})
export class EstadisticasProfesor {
  // 🧠 Campos de búsqueda
  busqueda: string = '';

  // 📊 Datos de rendimiento y asistencia
  rendimientos: Rendimiento[] = [
    { nombre: 'Ana Rodríguez', curso: '6°A', materia: 'Matemáticas', promedio: 4.2, estado: 'Aprobado' },
    { nombre: 'Juan Pérez', curso: '6°A', materia: 'Ciencias', promedio: 2.9, estado: 'Reprobado' }
  ];

  asistencias: Asistencia[] = [
    { nombre: 'Ana Rodríguez', curso: '6°A', asistidos: 28, ausentes: 2 },
    { nombre: 'Juan Pérez', curso: '6°A', asistidos: 25, ausentes: 5 }
  ];

  // ✏️ Nuevos datos
  nuevoRendimiento: Rendimiento = { nombre: '', curso: '', materia: '', promedio: 0, estado: 'Aprobado' };
  nuevaAsistencia: Asistencia = { nombre: '', curso: '', asistidos: 0, ausentes: 0 };

  // 📍 Buscar estudiantes
  get rendimientosFiltrados() {
    return this.rendimientos.filter(r =>
      r.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      r.curso.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  // ➕ Agregar rendimiento
  agregarRendimiento() {
    if (this.nuevoRendimiento.nombre && this.nuevoRendimiento.materia) {
      this.rendimientos.push({ ...this.nuevoRendimiento });
      this.nuevoRendimiento = { nombre: '', curso: '', materia: '', promedio: 0, estado: 'Aprobado' };
    }
  }

  // ➕ Agregar asistencia
  agregarAsistencia() {
    if (this.nuevaAsistencia.nombre && this.nuevaAsistencia.curso) {
      this.asistencias.push({ ...this.nuevaAsistencia });
      this.nuevaAsistencia = { nombre: '', curso: '', asistidos: 0, ausentes: 0 };
    }
  }

  // 🗑️ Eliminar fila
  eliminarRendimiento(index: number) {
    this.rendimientos.splice(index, 1);
  }

  eliminarAsistencia(index: number) {
    this.asistencias.splice(index, 1);
  }
}

