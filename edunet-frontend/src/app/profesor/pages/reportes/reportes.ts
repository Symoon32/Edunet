import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class Reportes implements OnInit {
  cursoId: number | null = null;
  periodo: string = '';
  reportes: any[] = [];
  loading = false;
  resultado: string = '';

  constructor(private route: ActivatedRoute, private reportesService: ReportesService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('cursoId');
      if (id) {
        this.cursoId = +id;
        this.cargarReportes();
      }
    });
  }

  cargarReportes() {
    if (this.cursoId) {
      this.loading = true;
      this.reportesService.getReportesCurso(this.cursoId).subscribe({
        next: (data) => {
          this.reportes = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando reportes', err);
          this.loading = false;
        }
      });
    }
  }

  generarReporte() {
    if (!this.cursoId || !this.periodo) {
      this.resultado = '⚠️ Debes seleccionar un periodo.';
      return;
    }

    this.loading = true;
    this.reportesService.generarReporteRendimiento(this.cursoId, { periodo: this.periodo }).subscribe({
      next: (res) => {
        this.resultado = '✅ Reporte de rendimiento generado con éxito.';
        this.cargarReportes();
        this.loading = false;
      },
      error: (err) => {
        this.resultado = '❌ Error al generar el reporte.';
        this.loading = false;
      }
    });
  }

  verDetalle(reporte: any) {
    // Para simplificar, mostramos el contenido en una alerta o consola
    // En una app real, esto podría abrir un modal o navegar a otra vista
    console.log('Detalle del reporte:', JSON.parse(reporte.contenido));
    alert('Contenido del reporte (ver consola para JSON):\n' + reporte.tipo + ' - ' + reporte.periodo);
  }

  eliminarReporte(idReporte: number) {
    if (confirm('¿Seguro que deseas eliminar este reporte?')) {
      this.reportesService.deleteReporte(idReporte).subscribe({
        next: () => {
          this.cargarReportes();
        },
        error: (err) => alert('Error al eliminar reporte')
      });
    }
  }
}
