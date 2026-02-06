import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class Reportes {

  estudiante: string = '';
  grado: string = '';
  detalle: string = '';
  resultado: string = '';

  generarReporte() {
    if (!this.estudiante || !this.grado) {
      this.resultado = '⚠️ Debes completar todos los campos obligatorios.';
      return;
    }

    this.resultado = `
      📘 Reporte generado con éxito:<br><br>
      👤 <b>Estudiante:</b> ${this.estudiante}<br>
      🎓 <b>Grado:</b> ${this.grado}<br>
      📝 <b>Observaciones:</b> ${this.detalle || 'Sin observaciones adicionales.'}
    `;
  }
}
