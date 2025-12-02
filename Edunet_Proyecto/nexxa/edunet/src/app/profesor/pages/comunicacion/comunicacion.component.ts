import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajesService } from '../../../shared/services/mensajes.service';
import { AuthStateService } from '../../../users/services/auth-state.service';
import { TokenPayload } from '../../../users/utils/jwt';

@Component({
  selector: 'app-comunicacion-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicacion.component.html',
  styleUrls: ['./comunicacion.component.css']
})
export class ComunicacionProfesorComponent implements OnInit {
  activeTab: 'inbox' | 'sent' | 'compose' = 'inbox';
  messages: any[] = [];
  loading = false;

  newMessage = {
    destinatario_email: '',
    asunto: '',
    mensaje: ''
  };

  currentUser: TokenPayload | null = null;
  feedback = '';

  constructor(
    private mensajesService: MensajesService,
    private authState: AuthStateService
  ) {}

  ngOnInit() {
    // Get user from token manually if service doesn't expose it directly
    const token = this.authState.snapshot.token;
    if (token) {
        try {
            this.currentUser = JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error('Error parsing token', e);
        }
    }
    this.loadMessages();
  }

  loadMessages() {
    if (!this.currentUser) return;
    this.loading = true;

    // Determine which endpoint to call based on tab
    const fetch$ = this.activeTab === 'sent'
       ? this.mensajesService.getEnviados()
       : this.mensajesService.getRecibidos();

    fetch$.subscribe({
        next: (data: any[]) => {
            this.messages = data;
            this.loading = false;
        },
        error: (err: any) => {
            console.error('Error loading messages', err);
            this.loading = false;
        }
    });
  }

  switchTab(tab: 'inbox' | 'sent' | 'compose') {
      this.activeTab = tab;
      if (tab !== 'compose') {
          this.loadMessages();
      }
  }

  sendMessage() {
      if (!this.currentUser) return;
      if (!this.newMessage.destinatario_email || !this.newMessage.asunto) return;

      const payload = {
          remitente_id: this.currentUser.id,
          destinatario_email: this.newMessage.destinatario_email,
          asunto: this.newMessage.asunto,
          contenido: this.newMessage.mensaje
      };

      this.mensajesService.enviarMensaje(payload).subscribe({
          next: () => {
              this.feedback = 'Mensaje enviado correctamente.';
              this.newMessage = { destinatario_email: '', asunto: '', mensaje: '' };
              setTimeout(() => {
                  this.feedback = '';
                  this.switchTab('sent');
              }, 1500);
          },
          error: (err: any) => {
              console.error(err);
              this.feedback = 'Error al enviar mensaje. Verifique el correo del destinatario.';
          }
      });
  }
}
