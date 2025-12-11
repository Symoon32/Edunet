import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventosService } from './services/eventos.service';

@Component({
  selector: 'app-anuncios.component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './anuncios.component.html',
  styleUrls: ['./anuncios.component.css']
})
export class AnunciosComponent implements OnInit {
  anuncios: any[] = [];
  anuncioForm: FormGroup;
  isEditing = false;
  selectedAnuncioId: number | null = null;

  constructor(
    private eventosService: EventosService,
    private fb: FormBuilder
  ) {
    this.anuncioForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: [''],
      ubicacion: [''],
      tipo: ['anuncio', Validators.required],
      destinatarios: ['todos', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAnuncios();
  }

  loadAnuncios() {
    this.eventosService.getEventos().subscribe({
      next: (data) => this.anuncios = data,
      error: (err) => console.error('Error cargando anuncios', err)
    });
  }

  onSubmit() {
    if (this.anuncioForm.valid) {
      if (this.isEditing && this.selectedAnuncioId) {
        this.eventosService.updateEvento(this.selectedAnuncioId, this.anuncioForm.value).subscribe({
          next: () => {
            alert('Anuncio actualizado correctamente');
            this.resetForm();
            this.loadAnuncios();
          },
          error: (err) => alert('Error actualizando anuncio: ' + (err.error?.message || 'Error desconocido'))
        });
      } else {
        this.eventosService.createEvento(this.anuncioForm.value).subscribe({
          next: () => {
            alert('Anuncio publicado correctamente');
            this.resetForm();
            this.loadAnuncios();
          },
          error: (err) => alert('Error publicando anuncio: ' + (err.error?.message || 'Error desconocido'))
        });
      }
    } else {
      alert('Por favor complete todos los campos requeridos.');
    }
  }

  editAnuncio(anuncio: any) {
    this.isEditing = true;
    this.selectedAnuncioId = anuncio.idEvento;
    this.anuncioForm.patchValue({
      titulo: anuncio.titulo,
      descripcion: anuncio.descripcion,
      fecha_inicio: anuncio.fecha_inicio ? new Date(anuncio.fecha_inicio).toISOString().slice(0, 16) : '',
      fecha_fin: anuncio.fecha_fin ? new Date(anuncio.fecha_fin).toISOString().slice(0, 16) : '',
      ubicacion: anuncio.ubicacion,
      tipo: anuncio.tipo,
      destinatarios: anuncio.destinatarios
    });
  }

  deleteAnuncio(idEvento: number) {
    if (confirm('¿Está seguro de que desea eliminar este anuncio?')) {
      this.eventosService.deleteEvento(idEvento).subscribe({
        next: () => {
          alert('Anuncio eliminado correctamente');
          this.loadAnuncios();
        },
        error: (err) => alert('Error eliminando anuncio: ' + (err.error?.message || 'Error desconocido'))
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.selectedAnuncioId = null;
    this.anuncioForm.reset({
      tipo: 'anuncio',
      destinatarios: 'todos'
    });
  }
}
