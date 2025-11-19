import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Clase {
  materia: string;
  grado: string;
  horario: string;
}

@Component({
  selector: 'app-gestion-clase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-clase.html',
  styleUrls: ['./gestion-clase.css']
})
export class GestionClase {
  clases: Clase[] = [
    { materia: 'Matemáticas', grado: '7°', horario: 'Lunes y Miércoles, 9:00am - 10:30am' },
    { materia: 'Ciencias Naturales', grado: '6°', horario: 'Martes y Jueves, 10:45am - 12:15pm' }
  ];

  eliminarClase(index: number) {
    this.clases.splice(index, 1);
  }

  editarClase(index: number) {
    const nuevaMateria = prompt('Nuevo nombre de la materia:', this.clases[index].materia);
    const nuevoGrado = prompt('Nuevo grado:', this.clases[index].grado);
    const nuevoHorario = prompt('Nuevo horario:', this.clases[index].horario);

    if (nuevaMateria && nuevoGrado && nuevoHorario) {
      this.clases[index] = { materia: nuevaMateria, grado: nuevoGrado, horario: nuevoHorario };
    }
  }
}
