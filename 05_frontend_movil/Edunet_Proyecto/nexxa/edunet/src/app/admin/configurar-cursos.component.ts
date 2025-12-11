import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursosAdminService } from './services/cursos.service';
import { MateriasAdminService } from './services/materias.service';
import { UserService } from '../users/services/user-service';

@Component({
  selector: 'app-configurar-cursos.component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './configurar-cursos.component.html',
  styleUrls: ['./configurar-cursos.component.css']
})
export class ConfigurarCursosComponent implements OnInit {
  cursos: any[] = [];
  materias: any[] = [];
  profesores: any[] = [];
  cursoForm: FormGroup;
  isEditing = false;
  selectedCursoId: number | null = null;

  constructor(
    private cursosService: CursosAdminService,
    private materiasService: MateriasAdminService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.cursoForm = this.fb.group({
      idMateria: ['', Validators.required],
      idProfesor: ['', Validators.required],
      periodo: ['', Validators.required],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      grado: ['', Validators.required],
      seccion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loadCursos();
    this.loadMaterias();
    this.loadProfesores();
  }

  loadCursos() {
    this.cursosService.getCursos().subscribe({
      next: (data) => this.cursos = data,
      error: (err) => console.error('Error cargando cursos', err)
    });
  }

  loadMaterias() {
    this.materiasService.getMaterias().subscribe({
      next: (data) => this.materias = data,
      error: (err) => console.error('Error cargando materias', err)
    });
  }

  loadProfesores() {
    this.userService.getUsers(2).subscribe({ // 2 is profesor role
      next: (data) => this.profesores = data,
      error: (err) => console.error('Error cargando profesores', err)
    });
  }

  onSubmit() {
    if (this.cursoForm.valid) {
      if (this.isEditing && this.selectedCursoId) {
        this.cursosService.updateCurso(this.selectedCursoId, this.cursoForm.value).subscribe({
          next: () => {
            alert('Curso actualizado correctamente');
            this.resetForm();
            this.loadCursos();
          },
          error: (err) => alert('Error actualizando curso: ' + (err.error?.message || 'Error desconocido'))
        });
      } else {
        this.cursosService.createCurso(this.cursoForm.value).subscribe({
          next: () => {
            alert('Curso creado correctamente');
            this.resetForm();
            this.loadCursos();
          },
          error: (err) => alert('Error creando curso: ' + (err.error?.message || 'Error desconocido'))
        });
      }
    } else {
      alert('Por favor complete todos los campos requeridos.');
    }
  }

  editCurso(curso: any) {
    this.isEditing = true;
    this.selectedCursoId = curso.idCurso;
    this.cursoForm.patchValue({
      idMateria: curso.idMateria,
      idProfesor: curso.idProfesor,
      periodo: curso.periodo,
      anio: curso.anio,
      grado: curso.grado,
      seccion: curso.seccion
    });
  }

  deleteCurso(idCurso: number) {
    if (confirm('¿Está seguro de que desea eliminar este curso? Esta acción no se puede deshacer.')) {
      this.cursosService.deleteCurso(idCurso).subscribe({
        next: () => {
          alert('Curso eliminado correctamente');
          this.loadCursos();
        },
        error: (err) => alert('Error eliminando curso: ' + (err.error?.message || 'Error desconocido'))
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.selectedCursoId = null;
    this.cursoForm.reset({
      anio: new Date().getFullYear()
    });
  }
}
