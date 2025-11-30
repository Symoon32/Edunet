import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CursosService } from '../../services/cursos.service';
import { ClasesService } from '../../services/clases.service';
import { AuthStateService } from '../../../users/services/auth-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gestion-clase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gestion-clase.html',
  styleUrls: ['./gestion-clase.css']
})
export class GestionClase implements OnInit {
  // Mode: 'cursos' (list of courses) or 'clases' (list of classes in a course)
  viewMode: 'cursos' | 'clases' = 'cursos';

  cursos: any[] = [];
  clases: any[] = [];
  selectedCurso: any = null;
  loading = false;

  constructor(
    private cursosService: CursosService,
    private clasesService: ClasesService,
    private authState: AuthStateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCursos();
  }

  private getUserIdFromToken(): number | null {
    const token = this.authState.snapshot.token;
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  loadCursos() {
    this.loading = true;
    const userId = this.getUserIdFromToken();
    if (!userId) {
       console.error("No user ID found");
       this.loading = false;
       return;
    }

    this.cursosService.getCursosProfesor(userId).subscribe({
      next: (data) => {
        this.cursos = data;
        this.loading = false;
        this.viewMode = 'cursos';
      },
      error: (err) => {
        console.error('Error loading courses', err);
        this.loading = false;
      }
    });
  }

  selectCurso(curso: any) {
    this.selectedCurso = curso;
    this.loading = true;
    this.clasesService.getClasesCurso(curso.idCurso).subscribe({
      next: (data) => {
        this.clases = data;
        this.loading = false;
        this.viewMode = 'clases';
      },
      error: (err) => {
        console.error('Error loading classes', err);
        this.loading = false;
      }
    });
  }

  goBackToCursos() {
    this.viewMode = 'cursos';
    this.selectedCurso = null;
    this.clases = [];
  }

  // Navigation actions for a specific class or course context
  navigateTo(action: string, id: number, type: 'curso' | 'clase') {
    // Construct URL based on action.
    // Example: /profesor/calificar/:idCurso
    // The router configuration must support these params.
    // For now, let's assume we pass query params or route params.

    // Based on user request: "lista de estudiantes, horario, tomar asistencia, agregar notas, reportes"

    // Mapping actions to routes:
    // 'estudiantes' -> /profesor/curso/:id/estudiantes
    // 'horario' -> /profesor/horario/:id
    // 'asistencia' -> /profesor/asistencia/:idClase
    // 'notas' -> /profesor/notas/:idCurso

    if (action === 'estudiantes') {
      // Assuming a route or component exists or we pass data
      // For now, log or simple alert as placeholders if routes don't exist yet
      console.log('Navigating to students for course', id);
    }

    // TODO: Implement actual routing once those pages are verified/created.
    // For now, I will create basic routed navigation structure or confirm with the user plan if I need to create those specific pages too.
    // The plan said "Ensure these buttons link to the respective functional components".

    // Let's try to map to existing routes or standard patterns
    switch(action) {
        case 'notas':
            this.router.navigate(['/profesor/cargar-notas', { cursoId: this.selectedCurso.idCurso }]);
            break;
        case 'asistencia':
             if (type === 'clase') {
                 this.router.navigate(['/profesor/asistencia', id]);
             }
             break;
        case 'reportes':
             this.router.navigate(['/profesor/reportes', { cursoId: this.selectedCurso.idCurso }]);
             break;
        case 'estudiantes':
             // Navigate to generic student list or materials if no specific student page
             // Or maybe we can link to materials/tareas here as "Gestion de Curso" action
             break;
    }
  }

  // Helper to open materials
  openMaterials() {
      if (this.selectedCurso) {
          this.router.navigate(['/profesor/materiales', this.selectedCurso.idCurso]);
      }
  }
}
