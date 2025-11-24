import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CursosService } from '../../services/cursos.service';

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

  // Grading model (simplified for now, could be per student)
  selectedStudent: any = null;
  nota: number | null = null;
  observacion: string = '';
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cursosService: CursosService
  ) {}

  ngOnInit() {
    // Check if we have a course ID in params (matrix params or query params)
    // The router.navigate passed { cursoId: ... } which usually goes to matrix params
    this.route.paramMap.subscribe(params => {
      const id = params.get('cursoId') || this.route.snapshot.paramMap.get('id'); // flexible
      if (id) {
        this.cursoId = +id;
        this.loadCourseData();
      }
    });
  }

  loadCourseData() {
    if (!this.cursoId) return;
    this.loading = true;

    // Load course info
    this.cursosService.getCurso(this.cursoId).subscribe(data => {
        this.cursoInfo = data;
    });

    // Load students
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
    this.nota = null; // Reset or load existing grade if API supported it
    this.observacion = '';
    this.feedbackMessage = '';
  }

  guardarNota() {
    if (!this.selectedStudent || this.nota === null) {
        this.showFeedback('Selecciona un estudiante e ingresa una nota válida', 'error');
        return;
    }

    // Here we would call an API to save the grade.
    // e.g., CalificacionesService.save(this.cursoId, this.selectedStudent.idUsuarios, this.nota, this.observacion)

    // Simulating success
    this.showFeedback(`Nota ${this.nota} guardada para ${this.selectedStudent.nombres}`, 'success');

    // Optional: clear selection
    // this.selectedStudent = null;
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
