import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialesService } from '../../services/materiales.service';
import { CursosService } from '../../services/cursos.service';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.css']
})
export class MaterialesComponent implements OnInit {
  loading = false;
  materiales: any[] = [];
  showForm = false;
  idCurso: number | null = null;
  cursoInfo: any = null;

  newMaterial = {
    titulo: '',
    descripcion: '',
    tipo: 'documento',
    url_archivo: '',
    idCurso: 0
  };
  selectedFile: File | null = null;

  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';
  ngModelUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialesService: MaterialesService,
    private cursosService: CursosService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('idCurso');
      if (id) {
        this.idCurso = +id;
        this.newMaterial.idCurso = this.idCurso;
        this.loadCursoInfo();
        this.loadMateriales();
      } else {
          // If no course ID, redirect back
          this.goBack();
      }
    });
  }

  loadCursoInfo() {
      // Potentially fetch course details to display header info
      // For now, we rely on previous navigation or fetch if service supports it
      // this.cursosService.getCursoById(this.idCurso)...
  }

  loadMateriales() {
    if (!this.idCurso) return;
    this.loading = true;
    this.materialesService.getMaterialesCurso(this.idCurso).subscribe({
      next: (data) => {
        this.materiales = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading materials', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  crearMaterial() {
    if (!this.newMaterial.titulo || !this.idCurso) return;

    const formData = new FormData();
    formData.append('titulo', this.newMaterial.titulo);
    formData.append('descripcion', this.newMaterial.descripcion);
    formData.append('tipo', this.newMaterial.tipo);
    formData.append('idCurso', this.newMaterial.idCurso.toString());

    if (this.selectedFile) {
      formData.append('archivo', this.selectedFile);
    } else {
      formData.append('url_archivo', this.newMaterial.url_archivo);
    }

    this.materialesService.createMaterial(formData).subscribe({
      next: (res) => {
        this.feedbackMessage = 'Material publicado exitosamente';
        this.feedbackType = 'success';
        this.showForm = false;
        this.resetForm();
        this.loadMateriales();
        setTimeout(() => this.feedbackMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error creating material', err);
        this.feedbackMessage = 'Error al publicar material';
        this.feedbackType = 'error';
      }
    });
  }

  eliminarMaterial(id: number) {
    if(!confirm('¿Estás seguro de eliminar este material?')) return;

    this.materialesService.deleteMaterial(id).subscribe({
      next: () => {
         this.loadMateriales();
      },
      error: (err) => console.error(err)
    });
  }

  resetForm() {
    this.newMaterial = {
      titulo: '',
      descripcion: '',
      tipo: 'documento',
      url_archivo: '',
      idCurso: this.idCurso || 0
    };
    this.selectedFile = null;
    this.ngModelUrl = '';
  }

  goBack() {
    this.router.navigate(['/profesor/gestion-clase']);
  }
}
