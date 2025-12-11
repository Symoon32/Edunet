import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfesorService } from '../../services/profesor-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-edit-profesor',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-edit-profesor.html',
  styleUrl: './create-edit-profesor.css'
})
export class CreateEditProfesor {
  profesor: any = { nombres: '', apellidos: '', correo: '', telefono: '', documento: '', direccion: '', fotoPerfil: '', cargo: '' };
  editMode = false;
  selectedFile: File | null = null;

  constructor(private profesorService: ProfesorService, private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editMode = true;
        this.profesorService.getProfesorById(id).subscribe({
          next: (p) => { this.profesor = { ...p }; },
          error: () => { alert('No se pudo cargar el profesor'); this.router.navigate(['/gestion-profesores']); }
        });
      }
    });
  }

  onSubmit() {
    const guardar = () => {
      if (this.editMode) {
        this.profesorService.updateProfesor(this.profesor.id, this.profesor).subscribe({ next: () => { alert('Profesor actualizado'); this.router.navigate(['/gestion-profesores']); }, error: () => alert('Error al actualizar') });
      } else {
        this.profesorService.createProfesor(this.profesor).subscribe({ next: () => { alert('Profesor creado'); this.profesor = { nombres: '', apellidos: '', correo: '', telefono: '', documento: '', direccion: '', fotoPerfil: '', cargo: '' }; }, error: () => alert('Error al crear') });
      }
    };

    if (this.selectedFile) {
      const fd = new FormData();
      fd.append('fotoPerfil', this.selectedFile);
      this.profesorService.uploadProfilePhoto(fd).subscribe({ next: (res: any) => { this.profesor.fotoPerfil = res.url; guardar(); }, error: () => alert('Error al subir foto') });
    } else { guardar(); }
  }

  onFileSelected(event: any) { const file = event.target.files[0]; if (file) { this.selectedFile = file; const reader = new FileReader(); reader.onload = (e: any) => this.profesor.fotoPerfil = e.target.result; reader.readAsDataURL(file); } }
}
