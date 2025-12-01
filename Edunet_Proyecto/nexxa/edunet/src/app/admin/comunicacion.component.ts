import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensajesService } from '../../shared/services/mensajes.service';
import { UserService } from '../../users/services/user.service';
import { TokenPayload } from '../../users/utils/jwt';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-comunicacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './comunicacion.component.html',
  styleUrls: ['./comunicacion.component.css']
})
export class ComunicacionComponent implements OnInit {
  mensajesService = inject(MensajesService);
  userService = inject(UserService);
  fb = inject(FormBuilder);

  activeTab: 'inbox' | 'sent' | 'compose' = 'inbox';

  mensajesRecibidos: any[] = [];
  mensajesEnviados: any[] = [];
  usuarios: any[] = []; // For recipient selection
  currentUser: TokenPayload | null = null;

  composeForm: FormGroup;
  mensajeSeleccionado: any = null;

  constructor() {
    this.composeForm = this.fb.group({
      destinatarioId: ['', Validators.required],
      asunto: ['', Validators.required],
      contenido: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getCurrentUser();
    this.loadInbox();
    this.loadUsers();
  }

  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        this.currentUser = jwtDecode<TokenPayload>(token);
      } catch(e) { console.error(e); }
    }
  }

  loadInbox() {
    this.mensajesService.getRecibidos().subscribe(data => this.mensajesRecibidos = data);
  }

  loadSent() {
    this.mensajesService.getEnviados().subscribe(data => this.mensajesEnviados = data);
  }

  loadUsers() {
    // Only admins should see all users ideally, or we filter.
    // Assuming userService.getUsers() exists and returns a list.
    this.userService.getUsers().subscribe(data => this.usuarios = data);
  }

  switchTab(tab: 'inbox' | 'sent' | 'compose') {
    this.activeTab = tab;
    this.mensajeSeleccionado = null;
    if (tab === 'inbox') this.loadInbox();
    if (tab === 'sent') this.loadSent();
  }

  verMensaje(mensaje: any) {
    this.mensajeSeleccionado = mensaje;
    if (this.activeTab === 'inbox' && !mensaje.leido) {
      this.mensajesService.markAsRead(mensaje.idMensajes).subscribe(() => {
        mensaje.leido = true;
      });
    }
  }

  enviarMensaje() {
    if (this.composeForm.invalid) return;

    const { destinatarioId, asunto, contenido } = this.composeForm.value;

    this.mensajesService.sendMessage(destinatarioId, asunto, contenido).subscribe({
      next: () => {
        alert('Mensaje enviado correctamente');
        this.composeForm.reset();
        this.switchTab('sent');
      },
      error: (err) => alert('Error al enviar mensaje')
    });
  }
}
