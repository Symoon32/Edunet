import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventosService } from '../admin/services/eventos.service';

@Component({
  selector: 'app-inicio-calendario-tutores',
  templateUrl: './calendario-tutores.component.html',
  styleUrls: ['./calendario-tutores.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CalendarioTutoresComponent implements OnInit {
  eventos: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  currentDate: Date = new Date();

  constructor(private eventosService: EventosService) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.loading = true;
    this.eventosService.getEventos().subscribe({
      next: (data) => {
        // Filter events for the current month or just show all sorted?
        // Let's show all upcoming events for now or sort by date.
        this.eventos = data.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
        this.error = 'No se pudieron cargar los eventos escolares.';
        this.loading = false;
      }
    });
  }

  // Helper to check if a day has an event (for the calendar grid if we decide to keep it dynamic)
  // For now, we will focus on the list view which is more reliable to implement quickly.
  // The calendar grid in HTML is hardcoded for July 2025.
  // Generating a dynamic calendar grid is complex logic.
  // I will replace the hardcoded table with a list view first,
  // or I can try to make the table dynamic but it requires logic to calculate days.
  // Given the time, a List View is better. But I will try to keep the "calendar look" if possible,
  // but strictly speaking, "Notificaciones de eventos" is the requirement.
  // I'll stick to a robust List View and maybe a simplified "Upcoming Events" section.
}
