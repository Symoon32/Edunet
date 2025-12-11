import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MateriasAdminService } from './services/materias.service';

@Component({
  selector: 'app-gestion-materias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-materias.component.html',
  styleUrls: ['./gestion-materias.component.css']
})
export class GestionMateriasComponent implements OnInit {
  materiasService = inject(MateriasAdminService);
  fb = inject(FormBuilder);

  materias: any[] = [];
  materiaForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;

  constructor() {
    this.materiaForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.loadMaterias();
  }

  loadMaterias() {
    this.materiasService.getMaterias().subscribe(data => this.materias = data);
  }

  onSubmit() {
    if (this.materiaForm.invalid) return;

    if (this.isEditing && this.editingId) {
      this.materiasService.updateMateria(this.editingId, this.materiaForm.value).subscribe(() => {
        this.resetForm();
        this.loadMaterias();
      });
    } else {
      this.materiasService.createMateria(this.materiaForm.value).subscribe(() => {
        this.resetForm();
        this.loadMaterias();
      });
    }
  }

  editarMateria(materia: any) {
    this.isEditing = true;
    this.editingId = materia.idMateria;
    this.materiaForm.patchValue(materia);
  }

  eliminarMateria(id: number) {
    if (confirm('¿Estás seguro de eliminar esta materia?')) {
      this.materiasService.deleteMateria(id).subscribe(() => this.loadMaterias());
    }
  }

  resetForm() {
    this.isEditing = false;
    this.editingId = null;
    this.materiaForm.reset();
  }
}
