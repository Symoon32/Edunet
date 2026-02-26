import { environment } from "@env/environment";
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
  private apiUrl = environment.apiUrl + '/api';

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
      error: (e: any) => {
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
      error: (e: any) => {
        console.error(e);
        this.loading = false;
      }
    });
  }

  loadProfesores() {
    this.http.get<any[]>(`${this.apiUrl}/estudiantes/cursos`).subscribe({
      next: (cursos) => {
        const profs = new Map();
        cursos.forEach(c => {
            // Check if idProfesor exists and is valid
            if (c.idProfesor && !profs.has(c.idProfesor)) {
                profs.set(c.idProfesor, {
                    idUsuarios: c.idProfesor,
                    nombres: c.nombreProfesor || 'Profesor',
                    apellidos: c.apellidosProfesor || 'Desconocido'
                });
            }
        });
        this.profesores = Array.from(profs.values());

        // If no professors found from courses (maybe system admin?), add a default Admin option?
        // For now, let's just leave it empty.
      },
      error: (err) => {
          console.error("Error loading courses for professors list", err);
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
      error: (e: any) => alert('Error al enviar mensaje')
    });
  }
}
