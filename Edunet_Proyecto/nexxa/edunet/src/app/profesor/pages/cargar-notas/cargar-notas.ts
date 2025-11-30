import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CursosService } from '../../services/cursos.service';
import { CalificacionesService } from '../../services/calificaciones.service';

@Component({
  selector: 'app-cargar-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cargar-notas.html',
  styleUrls: ['./cargar-notas.css']
})
export class CargarNotas implements OnInit {
  cursoId: number | null = null;
  estudiantes: any[] = [];
  loading = false;
  cursoInfo: any = null;

  // Grading model
  selectedStudent: any = null;
  nota: number | null = null;
  observacion: string = '';
  // New fields for grading details
  tipo: string = 'tarea'; // tarea, examen, proyecto, etc.
  peso: number = 100;
  nombreActividad: string = 'Actividad';

  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cursosService: CursosService,
    private calificacionesService: CalificacionesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('cursoId') || this.route.snapshot.paramMap.get('id');
      if (id) {
        this.cursoId = +id;
        this.loadCourseData();
      }
    });
  }

  loadCourseData() {
    if (!this.cursoId) return;
    this.loading = true;

    this.cursosService.getCurso(this.cursoId).subscribe(data => {
        this.cursoInfo = data;
    });

    this.cursosService.getEstudiantesCurso(this.cursoId).subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error loading students", err);
        this.loading = false;
      }
    });
  }

  selectStudent(estudiante: any) {
    this.selectedStudent = estudiante;
    this.nota = null;
    this.observacion = '';
    this.feedbackMessage = '';
  }

  guardarNota() {
    if (!this.selectedStudent || this.nota === null || !this.cursoId) {
        this.showFeedback('Selecciona un estudiante e ingresa una nota válida', 'error');
        return;
    }

    const payload = {
        idCurso: this.cursoId,
        idEstudiante: this.selectedStudent.idUsuarios,
        tipo: this.tipo,
        nombre: this.nombreActividad,
        valor: this.nota,
        peso: this.peso,
        comentarios: this.observacion
    };

    this.calificacionesService.createCalificacion(payload).subscribe({
        next: (res: any) => {
            this.showFeedback(`Nota ${this.nota} guardada para ${this.selectedStudent.nombres}`, 'success');
            // Optionally clear selection or reset form
        },
        error: (err: any) => {
            console.error('Error saving grade', err);
            this.showFeedback('Error al guardar la nota. Intente nuevamente.', 'error');
        }
    });
  }

  showFeedback(msg: string, type: 'success' | 'error') {
    this.feedbackMessage = msg;
    this.feedbackType = type;
    setTimeout(() => this.feedbackMessage = '', 3000);
  }

  goBack() {
    this.router.navigate(['/profesor/gestion-clase']);
  }
}
