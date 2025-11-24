import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cargar-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cargar-notas.html',
  styleUrls: ['./cargar-notas.css']
})
export class CargarNotas {
  estudiante: string = '';
  materia: string = '';
  nota: number | null = null;
  observacion: string = '';
  anuncio: string = '';
  resultado: string = '';

  guardarNota() {
    if (this.estudiante && this.materia && this.nota !== null) {
      this.resultado = `
        ✅ Nota guardada correctamente:<br>
        Estudiante: <strong>${this.estudiante}</strong><br>
        Materia: <strong>${this.materia}</strong><br>
        Nota: <strong>${this.nota}</strong><br>
        Observación: ${this.observacion || 'Ninguna'}
      `;

      // limpiar campos
      this.estudiante = '';
      this.materia = '';
      this.nota = null;
      this.observacion = '';
    } else {
      this.resultado = '⚠️ Debes llenar todos los campos obligatorios.';
    }
  }

  enviarAnuncio() {
    if (this.anuncio.trim()) {
      this.resultado = `📢 Boletín enviado: <em>${this.anuncio}</em>`;
      this.anuncio = '';
    } else {
      this.resultado = '⚠️ Escribe un boletín antes de enviarlo.';
    }
  }
}

