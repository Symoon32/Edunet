import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class Reportes implements OnInit {
  cursoId: number | null = null;
  estudiante: string = '';
  grado: string = '';
  detalle: string = '';
  resultado: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('cursoId');
      if (id) {
        this.cursoId = +id;
        // En una implementación real, aquí se cargarían datos del curso
        console.log('Generando reportes para el curso:', this.cursoId);
      }
    });
  }

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
