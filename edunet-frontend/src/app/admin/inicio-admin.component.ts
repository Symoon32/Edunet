import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesAdminService } from './services/reportes.service';
import { UserService } from '../users/services/user-service';

@Component({
  selector: 'app-inicio-admin.component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-admin.component.html',
  styleUrls: ['./inicio-admin.component.css']
})
export class InicioAdminComponent implements OnInit {
  stats: any = {
    totalEstudiantes: 0,
    totalProfesores: 0,
    totalCursos: 0 // Placeholder
  };
  recentActivity: any[] = [];
  currentUser: any = null;
  today: Date = new Date();

  constructor(
    private reportesService: ReportesAdminService,
    private userService: UserService
  ) {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
  }

  ngOnInit() {
    this.loadStats();
    this.loadActivity();
  }

  loadStats() {
    // Ideally, we'd have a specific stats endpoint.
    // For now, we can approximate by fetching lists (inefficient but works for small scale)
    // or just assume 0.

    this.userService.getUsers(1).subscribe(users => this.stats.totalEstudiantes = users.length);
    this.userService.getUsers(2).subscribe(users => this.stats.totalProfesores = users.length);
  }

  loadActivity() {
    this.reportesService.getActivityLog().subscribe({
      next: (data) => {
        this.recentActivity = data.slice(0, 5); // Show only top 5
      },
      error: (err) => console.error('Error loading activity', err)
    });
  }
}
