import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstudiantesService, Material, Curso } from './services/estudiantes.service';

interface MateriaConMateriales {
  nombreMateria: string;
  materiales: Material[];
}

@Component({
  selector: 'app-materiales-estudiantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materiales-estudiantes.component.html',
  styleUrls: ['./materiales-estudiantes.component.css']
})
export class MaterialesEstudiantesComponent implements OnInit {
  listaMateriales: MateriaConMateriales[] = [];
  loading: boolean = true;

  constructor(private estudiantesService: EstudiantesService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData() {
    this.estudiantesService.getMisCursos().subscribe({
      next: (cursos) => {
        this.listaMateriales = [];
        let cursosProcesados = 0;

        if (cursos.length === 0) {
          this.loading = false;
          return;
        }

        cursos.forEach(curso => {
          this.estudiantesService.getMateriales(curso.idCurso).subscribe({
            next: (materiales) => {
              if (materiales && materiales.length > 0) {
                this.listaMateriales.push({
                  nombreMateria: curso.materia,
                  materiales: materiales
                });
              }
              cursosProcesados++;
              if (cursosProcesados === cursos.length) {
                this.loading = false;
              }
            },
            error: (err) => {
              console.error(`Error al cargar materiales del curso ${curso.idCurso}`, err);
              cursosProcesados++;
              if (cursosProcesados === cursos.length) {
                this.loading = false;
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Error al cargar cursos', err);
        this.loading = false;
      }
    });
  }

  getIconClass(tipo: string): string {
    if (tipo === 'video') return 'bi bi-play-circle text-danger';
    if (tipo === 'documento') return 'bi bi-file-earmark-text text-primary';
    if (tipo === 'enlace') return 'bi bi-link-45deg text-info';
    return 'bi bi-file-earmark';
  }

  getBtnClass(tipo: string): string {
    if (tipo === 'video') return 'btn-success';
    if (tipo === 'enlace') return 'btn-warning';
    return 'btn-primary'; // documento
  }

  getActionText(tipo: string): string {
    if (tipo === 'video') return 'Ver Video';
    if (tipo === 'enlace') return 'Acceder';
    return 'Descargar';
  }
}
