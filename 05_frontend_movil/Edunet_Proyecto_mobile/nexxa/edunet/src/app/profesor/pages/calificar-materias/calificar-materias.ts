import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calificar-materias',
  standalone: true,  // 👈 importante si no usas módulos
  imports: [CommonModule, ReactiveFormsModule], // 👈 se importa aquí
  templateUrl: './calificar-materias.html',
  styleUrls: ['./calificar-materias.css']
})
export class CalificarMaterias {
  calificacionForm: FormGroup;
  historialCalificaciones: any[] = [];

  constructor(private fb: FormBuilder) {
    this.calificacionForm = this.fb.group({
      estudiante: ['', Validators.required],
      actividad: ['', Validators.required],
      nota: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  guardarCalificacion() {
    if (this.calificacionForm.valid) {
      this.historialCalificaciones.push(this.calificacionForm.value);
      this.calificacionForm.reset();
    }
  }
}
