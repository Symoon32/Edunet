import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesorService } from '../../services/profesor-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-profesor',
  imports: [FormsModule, CommonModule],
  templateUrl: './list-profesor.html',
  styleUrl: './list-profesor.css'
})
export class ListProfesor {
  profesores: any[] = [];
  profesoresFiltrados: any[] = [];
  busqueda: string = '';
  profesorSeleccionado: any = null;

  private router = inject(Router);

  constructor(private profesorService: ProfesorService) {
    this.cargarProfesores();
  }

  cargarProfesores() {
    this.profesorService.getProfesores().subscribe({
      next: (res) => { this.profesores = res; this.filtrarProfesores(); },
      error: () => { this.profesores = []; this.profesoresFiltrados = []; }
    });
  }

  filtrarProfesores() {
    const filtro = this.busqueda.trim().toLowerCase();
    if (!filtro) this.profesoresFiltrados = this.profesores;
    else this.profesoresFiltrados = this.profesores.filter(p =>
      (p.nombres + ' ' + p.apellidos).toLowerCase().includes(filtro) || (p.correo || '').toLowerCase().includes(filtro)
    );
  }

  buscarProfesor() { this.filtrarProfesores(); this.profesorSeleccionado = null; }

  seleccionarProfesor(p: any) { this.profesorSeleccionado = p; }

  crearProfesor() { this.router.navigate(['/create-profesor']); }

  modificarProfesor() { if (this.profesorSeleccionado) this.router.navigate(['/edit-profesor', this.profesorSeleccionado.id]); }

  eliminarProfesor() {
    if (this.profesorSeleccionado && confirm('¿Seguro que deseas eliminar este profesor?')) {
      this.profesorService.deleteProfesor(this.profesorSeleccionado.id).subscribe({
        next: () => { alert('Profesor eliminado'); this.cargarProfesores(); this.profesorSeleccionado = null; },
        error: () => { alert('Error al eliminar profesor'); }
      });
    }
  }
}
