import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '../../../users/services/auth-state.service';
import { ProfesorService } from '../../services/profesor-service';

@Component({
  selector: 'app-profesor-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profesor-home.html',
  styleUrl: './profesor-home.css'
})
export class ProfesorHome implements OnInit {
  nombreProfesor: string = 'Profesor';

  features = [
    {
      title: 'Mis Cursos',
      desc: 'Visualiza todos los cursos que tienes asignados. Selecciona un curso para ver sus materias y sesiones.',
      icon: 'bi-journal-richtext',
      link: '/profesor/gestion-clase',
      delay: '0.1s'
    },
    {
      title: 'Gestión de Clases',
      desc: 'Dentro de cada curso, accede a tus clases para tomar asistencia, ver el horario y gestionar estudiantes.',
      icon: 'bi-people',
      link: '/profesor/gestion-clase', // Redirects to same flow
      delay: '0.2s'
    },
    {
      title: 'Calificaciones',
      desc: 'Registra y actualiza las notas de tus estudiantes. Genera reportes de rendimiento académico.',
      icon: 'bi-pencil-square',
      link: '/profesor/gestion-clase', // Integrated flow
      delay: '0.3s'
    },
    {
      title: 'Estadísticas',
      desc: 'Analiza el progreso de tus cursos con gráficos y reportes detallados.',
      icon: 'bi-graph-up',
      link: '/profesor/estadisticas',
      delay: '0.4s'
    }
  ];

  constructor(
    private authState: AuthStateService,
    private profesorService: ProfesorService
  ) {}

  ngOnInit() {
    this.authState.authState$.subscribe(state => {
      if (state.isAuthenticated && state.role === 2) {
        // Attempt to get more details if available, or use cached name
        // For now, we assume we might need to fetch profile if name isn't stored in state fully
        // But let's check what authState has.
        // If not available, we can fetch profile.
        this.getProfile(state.userId);
      }
    });
  }

  getProfile(userId: number | null) {
    if(!userId) return;
    this.profesorService.getPerfil(userId).subscribe({
      next: (data) => {
        this.nombreProfesor = `${data.nombres} ${data.apellidos}`;
      },
      error: (err) => console.error(err)
    });
  }
}
