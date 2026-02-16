import { API_BASE_URL } from '../../api-config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MensajesService {
  private apiUrl = `${API_BASE_URL}/mensajes`;

  constructor(private http: HttpClient) {}

  enviarMensaje(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, payload);
  }

  // Backward compatibility for existing components
  sendMessage(destinatarioId: number, asunto: string, contenido: string): Observable<any> {
    return this.enviarMensaje({ idDestinatario: destinatarioId, asunto, contenido });
  }

  getRecibidos(userId?: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recibidos`);
  }

  getEnviados(userId?: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/enviados`);
  }

  markAsRead(idMensaje: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idMensaje}/leer`, {});
  }
}
