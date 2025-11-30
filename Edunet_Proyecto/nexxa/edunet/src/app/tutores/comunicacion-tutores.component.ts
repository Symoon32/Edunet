import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MensajesService } from '../shared/services/mensajes.service';
import { UserService } from '../users/services/user-service';
import { TutoresService } from './services/tutores.service';

@Component({
  selector: 'app-inicio-comunicacion-tutores',
  templateUrl: './comunicacion-tutores.component.html',
  styleUrls: ['./comunicacion-tutores.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class ComunicacionTutoresComponent implements OnInit {
  mensajeForm: FormGroup;
  destinatarios: any[] = [];
  estudiantes: any[] = [];
  loading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private mensajesService: MensajesService,
    private userService: UserService,
    private tutoresService: TutoresService
  ) {
    this.mensajeForm = this.fb.group({
      estudianteId: ['', Validators.required],
      destinatarioId: ['', Validators.required],
      asunto: ['', [Validators.required, Validators.minLength(5)]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.loading = true;

    // Cargar estudiantes del acudiente
    this.tutoresService.getMisEstudiantes().subscribe({
        next: (data) => {
            this.estudiantes = data;
            // Pre-select first student
            if (this.estudiantes.length > 0) {
                this.mensajeForm.patchValue({ estudianteId: this.estudiantes[0].idUsuarios });
            }
        },
        error: (err) => console.error('Error cargando estudiantes', err)
    });

    // Cargar destinatarios (Profesores y Admins)
    // Para simplificar, cargaremos todos los profesores y administradores.
    // Idealmente filtraríamos por curso del estudiante seleccionado.
    // Combinaremos las listas.

    // Primero admins (rol 4)
    this.userService.getUsers(4).subscribe({
        next: (admins) => {
             // Luego profesores (rol 2)
             this.userService.getUsers(2).subscribe({
                 next: (profes) => {
                     // Formatear para mostrar Rol en el nombre
                     const adminsFormatted = admins.map((u: any) => ({ ...u, label: `Admin: ${u.nombres} ${u.apellidos}` }));
                     const profesFormatted = profes.map((u: any) => ({ ...u, label: `Prof: ${u.nombres} ${u.apellidos}` }));

                     this.destinatarios = [...adminsFormatted, ...profesFormatted];
                     this.loading = false;
                 },
                 error: (err) => {
                     console.error('Error cargando profesores', err);
                     this.destinatarios = admins.map((u: any) => ({ ...u, label: `Admin: ${u.nombres} ${u.apellidos}` })); // Al menos mostramos admins
                     this.loading = false;
                 }
             });
        },
        error: (err) => {
             console.error('Error cargando admins', err);
             this.loading = false;
        }
    });
  }

  onSubmit(): void {
    if (this.mensajeForm.invalid) {
      return;
    }

    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const { destinatarioId, asunto, mensaje, estudianteId } = this.mensajeForm.value;

    // Agregamos contexto del estudiante al mensaje automáticamente
    const estudiante = this.estudiantes.find(e => e.idUsuarios == estudianteId);
    const nombreEstudiante = estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : 'Desconocido';

    const contenidoCompleto = `Referente al estudiante: ${nombreEstudiante}\n\n${mensaje}`;

    this.mensajesService.sendMessage(destinatarioId, asunto, contenidoCompleto).subscribe({
      next: () => {
        this.successMessage = 'Mensaje enviado correctamente.';
        this.mensajeForm.reset();
        // Restore student selection
        if (this.estudiantes.length > 0) {
            this.mensajeForm.patchValue({ estudianteId: this.estudiantes[0].idUsuarios });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error enviando mensaje', err);
        this.errorMessage = 'Hubo un error al enviar el mensaje. Intente nuevamente.';
        this.loading = false;
      }
    });
  }
}
