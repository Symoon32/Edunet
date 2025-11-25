import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfesorService } from '../../services/profesor-service';
import { AuthStateService } from '../../../users/services/auth-state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-clase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-clase.html',
  styleUrls: ['./gestion-clase.css']
})
export class GestionClase implements OnInit {
  // Navigation State
  viewState: 'courses' | 'classes' | 'details' = 'courses';

  // Data State
  courses: any[] = [];
  classes: any[] = [];
  selectedCourse: any = null;
  selectedClass: any = null;

  // Tab State for Details View
  activeTab: 'overview' | 'students' | 'attendance' | 'grades' | 'reports' = 'overview';

  // Loading/Error State
  loading = false;
  error = '';
  userId: number | null = null;

  constructor(
    private profesorService: ProfesorService,
    private authState: AuthStateService
  ) {}

  ngOnInit() {
    this.authState.authState$.subscribe(state => {
      if (state.userId && state.role === 2) {
        this.userId = state.userId;
        this.loadCourses();
      }
    });
  }

  // --- Step 1: Load Courses ---
  loadCourses() {
    if (!this.userId) return;
    this.loading = true;
    this.profesorService.getCursos(this.userId).subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
        this.viewState = 'courses';
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar los cursos.';
        this.loading = false;
      }
    });
  }

  selectCourse(course: any) {
    this.selectedCourse = course;
    this.loadClasses(course.idCurso);
  }

  // --- Step 2: Load Classes (Subjects/Sessions) ---
  loadClasses(courseId: number) {
    this.loading = true;
    this.profesorService.getClasesPorCurso(courseId).subscribe({
      next: (data) => {
        this.classes = data;
        this.loading = false;
        this.viewState = 'classes';
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar las clases.';
        this.loading = false;
      }
    });
  }

  selectClass(clase: any) {
    this.selectedClass = clase;
    this.viewState = 'details';
    this.activeTab = 'overview';
    // Here we would load specific details for the class (students, etc) if not already available
    // For now we assume we have enough or will fetch on tab switch
  }

  // --- Navigation Helpers ---
  goBackToCourses() {
    this.selectedCourse = null;
    this.viewState = 'courses';
  }

  goBackToClasses() {
    this.selectedClass = null;
    this.viewState = 'classes';
  }

  setActiveTab(tab: any) {
    this.activeTab = tab;
  }
}
