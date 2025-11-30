import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../users/services/auth-state.service';
import { jwtDecode } from 'jwt-decode';

interface UserToken {
  id: number;
}

interface Mensaje {
  idMensaje: number;
  idRemitente: number;
  idDestinatario: number;
  asunto: string;
  contenido: string;
  fecha_envio: string;
  leido: boolean;
  nombre_remitente?: string;
  apellido_remitente?: string;
  nombre_destinatario?: string;
  apellido_destinatario?: string;
}

interface Usuario {
  idUsuarios: number;
  nombres: string;
  apellidos: string;
  rol: number; // 2 for profesor
}

@Component({
  selector: 'app-mensajes-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mensajes-estudiantes.component.html',
  styles: [`
    .mensajes-container { max-width: 800px; margin: 0 auto; }
    .mensaje-card { cursor: pointer; transition: background 0.2s; }
    .mensaje-card:hover { background-color: #f8f9fa; }
    .mensaje-leido { opacity: 0.7; }
    .mensaje-no-leido { font-weight: bold; background-color: #e9ecef; }
  `]
})
export class MensajesEstudiantesComponent implements OnInit {
  activeTab: 'inbox' | 'sent' | 'compose' = 'inbox';
  mensajesRecibidos: Mensaje[] = [];
  mensajesEnviados: Mensaje[] = [];
  profesores: Usuario[] = [];

  nuevoMensaje = {
    destinatario: '',
    asunto: '',
    contenido: ''
  };

  loading: boolean = false;
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.loadMensajes();
    this.loadProfesores();
  }

  setTab(tab: 'inbox' | 'sent' | 'compose') {
    this.activeTab = tab;
    if (tab === 'inbox') this.loadMensajes();
    if (tab === 'sent') this.loadEnviados();
  }

  loadMensajes() {
    this.loading = true;
    this.http.get<Mensaje[]>(`${this.apiUrl}/mensajes/recibidos`).subscribe({
      next: (data) => {
        this.mensajesRecibidos = data;
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      }
    });
  }

  loadEnviados() {
    this.loading = true;
    this.http.get<Mensaje[]>(`${this.apiUrl}/mensajes/enviados`).subscribe({
      next: (data) => {
        this.mensajesEnviados = data;
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      }
    });
  }

  // Load teachers for the "To" dropdown.
  // We can get teachers from the student's courses.
  loadProfesores() {
    this.http.get<any[]>(`${this.apiUrl}/estudiantes/cursos`).subscribe({
      next: (cursos) => {
        // Extract unique professors
        const profs = new Map();
        cursos.forEach(c => {
            // The API returns nombreProfesor, apellidosProfesor but not ID explicitly in the join?
            // Wait, CursosEstudianteController join returns `u.nombres` but ID?
            // `INNER JOIN usuarios u ON c.idProfesor = u.idUsuarios`
            // But the select is `c.*, m.nombre..., u.nombres...`
            // It might not be selecting `u.idUsuarios` explicitly if `c.*` doesn't cover it (it covers curso fields).
            // Actually `c.idProfesor` exists in `cursos`. So we can use that.
            if (!profs.has(c.idProfesor)) {
                profs.set(c.idProfesor, {
                    idUsuarios: c.idProfesor,
                    nombres: c.nombreProfesor,
                    apellidos: c.apellidosProfesor
                });
            }
        });
        this.profesores = Array.from(profs.values());
      }
    });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.destinatario || !this.nuevoMensaje.asunto || !this.nuevoMensaje.contenido) return;

    this.http.post(`${this.apiUrl}/mensajes/enviar`, {
      idDestinatario: this.nuevoMensaje.destinatario,
      asunto: this.nuevoMensaje.asunto,
      contenido: this.nuevoMensaje.contenido
    }).subscribe({
      next: () => {
        alert('Mensaje enviado');
        this.nuevoMensaje = { destinatario: '', asunto: '', contenido: '' };
        this.setTab('sent');
      },
      error: (e) => alert('Error al enviar mensaje')
    });
  }
}
