import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxScannerQrcodeComponent, ScannerQRCodeResult } from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [NgxScannerQrcodeComponent],
  templateUrl: './qr-scanner.html',
  styleUrls: ['./qr-scanner.css']
})
export class QrScannerComponent {

  constructor(private http: HttpClient) { }

  public onEvent(e: ScannerQRCodeResult[], action: any): void {
    if (e && e.length > 0) {
      const qrData = e[0].value;
      console.log('QR Code Data:', qrData);

      // Detener el escáner después de una detección exitosa
      action.stop();

      // Aquí puedes enviar los datos al backend
      this.http.post('/api/asistencia', { qrData })
        .subscribe({
          next: (response) => {
            console.log('Asistencia registrada:', response);
            alert('Asistencia registrada con éxito');
          },
          error: (error) => {
            console.error('Error al registrar la asistencia:', error);
            alert('Hubo un error al registrar la asistencia. Por favor, inténtalo de nuevo.');
          }
        });
    }
  }
}
