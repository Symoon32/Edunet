import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CursosService } from '../../services/cursos.service';
import { ClasesService } from '../../services/clases.service';
import { AuthStateService } from '../../../users/services/auth-state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gestion-clase',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-clase.html',
  styleUrls: ['./gestion-clase.css']
})
export class GestionClase implements OnInit {
  // Mode: 'cursos' (list of courses) or 'clases' (list of classes in a course)
  viewMode: 'cursos' | 'clases' = 'cursos';

  cursos: any[] = [];
  clases: any[] = [];

  // Filters for Cursos
  searchCursos: string = '';
  filterAnio: string = 'todos';

  // Filters for Clases
  searchClases: string = '';
  filterMes: string = 'todos';

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

  get cursosFiltrados() {
    const term = this.searchCursos.toLowerCase().trim();
    return this.cursos.filter(c => {
      const matchesSearch =
        (c.materia || '').toLowerCase().includes(term) ||
        (c.grado + '' + c.seccion).toLowerCase().includes(term);

      const matchesAnio = this.filterAnio === 'todos' || (c.anio + '') === this.filterAnio;

      return matchesSearch && matchesAnio;
    });
  }

  get clasesFiltradas() {
     const term = this.searchClases.toLowerCase().trim();
     return this.clases.filter(cl => {
        const matchesSearch = (cl.tema || '').toLowerCase().includes(term) || (cl.descripcion || '').toLowerCase().includes(term);

        let matchesMes = true;
        if (this.filterMes !== 'todos') {
            const date = new Date(cl.fecha);
            const mes = (date.getMonth() + 1).toString();
            matchesMes = mes === this.filterMes;
        }

        return matchesSearch && matchesMes;
     });
  }

  get uniqueAnios() {
    return [...new Set(this.cursos.map(c => c.anio))].sort((a,b) => b-a);
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
    switch(action) {
        case 'notas':
            // Se envía el cursoId como parámetro de matriz para que CargarNotas lo detecte
            this.router.navigate(['/profesor/cargar-notas', { cursoId: id }]);
            break;
        case 'asistencia':
             if (type === 'clase') {
                 this.router.navigate(['/profesor/asistencia', id]);
             }
             break;
        case 'reportes':
             this.router.navigate(['/profesor/reportes', { cursoId: id }]);
             break;
        case 'materiales':
             this.router.navigate(['/profesor/materiales', id]);
             break;
        case 'estudiantes':
             // Podríamos redirigir a una lista de estudiantes si existiera,
             // por ahora cargamos notas que ya muestra la lista
             this.router.navigate(['/profesor/cargar-notas', { cursoId: id }]);
             break;
        case 'horario':
             this.router.navigate(['/profesor/estadisticas']); // Fallback to stats if horario page is missing
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
