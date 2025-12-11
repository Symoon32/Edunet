import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsistenciaService } from '../../services/asistencia.service';
import { ClasesService } from '../../services/clases.service';
import { CursosService } from '../../services/cursos.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.css']
})
export class AsistenciaComponent implements OnInit {
  idClase: number | null = null;
  claseInfo: any = null;
  estudiantes: any[] = [];
  loading = false;

  // Model for attendance: key = studentId, value = status (presente, ausente, tardanza)
  asistencia: { [key: number]: string } = {};

  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asistenciaService: AsistenciaService,
    private clasesService: ClasesService,
    private cursosService: CursosService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('idClase');
      if (id) {
        this.idClase = +id;
        this.loadClaseInfo();
      }
    });
  }

  loadClaseInfo() {
      if (!this.idClase) return;
      this.loading = true;

      // 1. Get class info
      this.clasesService.getClase(this.idClase).subscribe({
          next: (clase: any) => {
              this.claseInfo = clase;
              // 2. Get students for the course of this class
              this.loadEstudiantes(clase.idCurso);
          },
          error: (err: any) => {
              console.error('Error loading class', err);
              this.loading = false;
          }
      });
  }

  loadEstudiantes(idCurso: number) {
      this.cursosService.getEstudiantesCurso(idCurso).subscribe({
          next: (data: any[]) => {
              this.estudiantes = data;
              // Initialize default attendance (Presente)
              this.estudiantes.forEach((est: any) => {
                  this.asistencia[est.idUsuarios] = 'presente';
              });
              // Check if attendance already taken
              this.checkExistingAttendance();
          },
          error: (err: any) => {
              console.error('Error loading students', err);
              this.loading = false;
          }
      });
  }

  checkExistingAttendance() {
      if (!this.idClase) return;
      this.asistenciaService.getAsistenciaClase(this.idClase).subscribe({
          next: (data: any[]) => {
              if (data && data.length > 0) {
                  data.forEach((record: any) => {
                      this.asistencia[record.idEstudiante] = record.estado;
                  });
              }
              this.loading = false;
          },
          error: (err: any) => {
              console.error(err);
              this.loading = false;
          }
      });
  }

  guardarAsistencia() {
      if (!this.idClase) return;

      const records = Object.keys(this.asistencia).map(idEstudiante => ({
          idClase: this.idClase,
          idEstudiante: +idEstudiante,
          estado: this.asistencia[+idEstudiante]
      }));

      this.asistenciaService.saveAsistencia(records).subscribe({
          next: () => {
              this.feedbackMessage = 'Asistencia guardada correctamente.';
              this.feedbackType = 'success';
              setTimeout(() => this.feedbackMessage = '', 3000);
          },
          error: (err: any) => {
              console.error('Error saving attendance', err);
              this.feedbackMessage = 'Error al guardar asistencia.';
              this.feedbackType = 'error';
          }
      });
  }

  goBack() {
      this.router.navigate(['/profesor/gestion-clase']);
  }
}
