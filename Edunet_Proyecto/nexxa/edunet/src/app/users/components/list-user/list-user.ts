
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { CursosAdminService } from '../../../admin/services/cursos.service';
import { MateriasAdminService } from '../../../admin/services/materias.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-user.html',
  styleUrls: ['./list-user.css']
})
export class ListUser {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  busqueda: string = '';
  usuarioSeleccionado: any = null;
  tituloVista: string = 'Gestión de Usuarios';
  rolFiltrado: number | null = null;
  mostrarModalAsignarCurso = false;
  mostrarModalAsignarMateria = false;
  cursos: any[] = [];
  materias: any[] = [];
  selectedCursoId: number | null = null;
  selectedMateriaId: number | null = null;

  private router = inject(Router);

  constructor(
    private userService: UserService,
    private cursosAdminService: CursosAdminService,
    private materiasAdminService: MateriasAdminService
  ) {
    const currentRoute = this.router.url;
    if (currentRoute.includes('gestion-estudiantes')) {
      this.tituloVista = 'Gestión de Estudiantes';
      this.rolFiltrado = 1;
    } else if (currentRoute.includes('gestion-profesores')) {
      this.tituloVista = 'Gestión de Profesores';
      this.rolFiltrado = 2;
    } else if (currentRoute.includes('gestion-admins')) {
      this.tituloVista = 'Gestión de Administradores';
      this.rolFiltrado = 4;
    }
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.userService.getUsers(this.rolFiltrado).subscribe({
      next: (res) => {
        this.usuarios = res;
        this.filtrarUsuarios();
      },
      error: (err) => {
        this.usuarios = [];
        this.usuariosFiltrados = [];
      }
    });
  }

  filtrarUsuarios() {
    const filtro = this.busqueda.trim().toLowerCase();
    if (!filtro) {
      this.usuariosFiltrados = this.usuarios;
    } else {
      this.usuariosFiltrados = this.usuarios.filter(u =>
        (u.nombres + ' ' + u.apellidos).toLowerCase().includes(filtro) ||
        (u.correo || '').toLowerCase().includes(filtro)
      );
    }
  }

  buscarUsuario() {
    this.filtrarUsuarios();
    this.usuarioSeleccionado = null;
  }

  seleccionarUsuario(user: any) {
    this.usuarioSeleccionado = user;
  }

  crearUsuario() {
    // Aquí podrías navegar a la vista de crear usuario o abrir un modal
    this.router.navigate(['/admin/create-user'])
    
  }

  modificarUsuario(user: any = null) {
    const usuario = user || this.usuarioSeleccionado;
    if (usuario) {
      this.router.navigate(['/edit-user', usuario.correo]);
    }
  }

  inactivarUsuario() {
    if (this.usuarioSeleccionado && confirm('¿Seguro que deseas inactivar este usuario?')) {
      // Assuming the service is updated to handle inactivation
      this.userService.inactivateUser(this.usuarioSeleccionado.correo).subscribe({
        next: () => {
          alert('Usuario inactivado');
          this.cargarUsuarios();
          this.usuarioSeleccionado = null;
        },
        error: () => {
          alert('Error al inactivar usuario');
        }
      });
    }
  }

  abrirModalAsignarCurso() {
    if (this.usuarioSeleccionado) {
      this.cursosAdminService.getCursos().subscribe(cursos => {
        this.cursos = cursos;
        this.mostrarModalAsignarCurso = true;
      });
    }
  }

  cerrarModalAsignarCurso() {
    this.mostrarModalAsignarCurso = false;
  }

  asignarCurso() {
    if (this.selectedCursoId && this.usuarioSeleccionado) {
      this.cursosAdminService.assignStudentToCurso(this.selectedCursoId, this.usuarioSeleccionado.idUsuarios).subscribe({
        next: () => {
          alert('Estudiante asignado al curso correctamente.');
          this.cerrarModalAsignarCurso();
        },
        error: (err) => {
          alert('Error al asignar el curso: ' + err.error.message);
        }
      });
    } else {
      alert('Por favor, selecciona un curso.');
    }
  }

  abrirModalAsignarMateria() {
    if (this.usuarioSeleccionado) {
      this.cursosAdminService.getCursos().subscribe(cursos => {
        this.cursos = cursos;
        this.materiasAdminService.getMaterias().subscribe(materias => {
          this.materias = materias;
          this.mostrarModalAsignarMateria = true;
        });
      });
    }
  }

  cerrarModalAsignarMateria() {
    this.mostrarModalAsignarMateria = false;
  }

  asignarMateria() {
    if (this.selectedCursoId && this.selectedMateriaId && this.usuarioSeleccionado) {
      this.cursosAdminService.assignProfesorToCurso(this.selectedCursoId, this.usuarioSeleccionado.idUsuarios, this.selectedMateriaId).subscribe({
        next: () => {
          alert('Profesor asignado a la materia correctamente.');
          this.cerrarModalAsignarMateria();
        },
        error: (err) => {
          alert('Error al asignar la materia: ' + err.error.message);
        }
      });
    } else {
      alert('Por favor, selecciona un curso y una materia.');
    }
  }

  obtenerRol(rol: string | number): string {
    switch (rol) {
      case '1': case 1: return 'Estudiante';
      case '2': case 2: return 'Profesor';
      case '3': case 3: return 'Acudiente';
      case '4': case 4: return 'Administrador';
      default: return 'Desconocido';
    }
  }
}
