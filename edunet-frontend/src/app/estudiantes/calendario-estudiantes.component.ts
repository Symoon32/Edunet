import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstudiantesService, Evento } from './services/estudiantes.service';

@Component({
  selector: 'app-calendario-estudiantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-estudiantes.component.html',
  styleUrls: ['./calendario-estudiantes.component.css']
})
export class CalendarioEstudiantesComponent implements OnInit {
  eventos: Evento[] = [];
  loading: boolean = true;
  currentDate: Date = new Date();
  daysInMonth: (Date | null)[] = [];
  monthName: string = '';

  constructor(private estudiantesService: EstudiantesService) {}

  ngOnInit(): void {
    this.generateCalendar(this.currentDate);
    this.loadEventos();
  }

  loadEventos() {
    this.estudiantesService.getEventos().subscribe({
      next: (data) => {
        this.eventos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
        this.loading = false;
      }
    });
  }

  generateCalendar(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    this.monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    // Fill empty days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Fill days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    this.daysInMonth = days;
  }

  getEventsForDay(date: Date | null): Evento[] {
    if (!date) return [];
    return this.eventos.filter(e => {
      const eventDate = new Date(e.fecha_inicio);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  }

  hasEvent(date: Date | null): boolean {
    return this.getEventsForDay(date).length > 0;
  }
}
