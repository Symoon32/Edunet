
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-edit-user',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-edit-user.html',
  styleUrl: './create-edit-user.css'
})
export class CreateEditUser {
  @ViewChild('userForm') userForm!: NgForm;

  usuario: any = {
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    documento: '',
    direccion: '',
    fotoPerfil: '',
    password: '',
    idRol: '',
    grado: '',
    contacto_emergencia: '',
    telefono_contacto_emergencia: '',
    curso_asignado: '',
    nombre_estudiante_acargo: '',
    documento_estudiante: '',
    parentezco: '',
    cargo_admin: ''
  };
  editMode = false;
  selectedFile: File | null = null;
  currentUser: any = null; // To store the logged-in user's info
  isCurrentUserRector = false;

  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router) {
    // This is a simplified way to get the current user. In a real app, this would come from a global state/service.
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
      this.isCurrentUserRector = this.currentUser?.is_rector;
    }

    this.route.paramMap.subscribe(params => {
      const correo = params.get('correo');
      if (correo) {
        this.editMode = true;
        this.userService.getUserByCorreo(correo).subscribe({
          next: (user) => {
            this.usuario = { ...user, password: '', is_rector: user.is_rector || false };
          },
          error: () => {
            alert('No se pudo cargar el usuario');
            this.router.navigate(['/']);
          }
        });
      }
    });
  }

  onSubmit() {
    // Explicitly check validity in case browser validation is bypassed or subtle
    if (this.userForm && this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const guardarUsuario = () => {
      if (this.editMode) {
        // No enviar campo correo en el body, solo los editables
        const usuarioEdit = { ...this.usuario };
        delete usuarioEdit.correo;
        if (!usuarioEdit.password) delete usuarioEdit.password;

        this.userService.updateUser(this.usuario.correo, usuarioEdit).subscribe({
          next: () => {
            alert('Usuario actualizado correctamente');
            // If updating self, refresh localStorage
            if (this.currentUser && this.currentUser.correo === this.usuario.correo) {
              const updatedUser = {
                ...this.currentUser,
                nombres: `${this.usuario.nombres} ${this.usuario.apellidos}`,
                fotoPerfil: this.usuario.fotoPerfil,
                is_rector: this.usuario.is_rector
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              // Optional: trigger a page reload or state update to refresh navbar
              window.location.reload();
            }
            this.navigateBack(this.usuario.idRol);
          },
          error: (err) => {
            alert('Error al actualizar usuario: ' + (err.error?.error || 'Error desconocido'));
          }
        });
      } else {
        this.userService.createUser(this.usuario).subscribe({
          next: () => {
            alert('Usuario registrado correctamente');
            const rol = this.usuario.idRol;
            this.resetUsuario(); // método para limpiar el objeto
            this.navigateBack(rol);
          },
          error: (err) => {
            console.error('Error creating user:', err);
            alert('Error al registrar usuario: ' + (err.error?.error || 'Error desconocido'));
          }
        });
      }
    };

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('fotoPerfil', this.selectedFile);
      this.userService.uploadProfilePhoto(formData).subscribe({
        next: (res: any) => {
          this.usuario.fotoPerfil = res.url;
          guardarUsuario();
        },
        error: (err) => {
          console.error('Error uploading photo:', err);
          alert('Error al subir la foto de perfil');
        }
      });
    } else {
      guardarUsuario();
    }
  }

private resetUsuario() {
  this.usuario = {
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    documento: '',
    direccion: '',
    fotoPerfil: '',
    password: '',
    idRol: '',
    grado: '',
    contacto_emergencia: '',
    telefono_contacto_emergencia: '',
    curso_asignado: '',
    nombre_estudiante_acargo: '',
    documento_estudiante: '',
    parentezco: '',
    cargo_admin: ''
    };
}

  private navigateBack(rol: string | number) {
    const rolNum = Number(rol);
    // Support both idRol and rol for navigation
    const finalRol = rolNum || Number(this.usuario.idRol);
    switch (finalRol) {
      case 1:
        this.router.navigate(['/admin/gestion-estudiantes']);
        break;
      case 2:
        this.router.navigate(['/admin/gestion-profesores']);
        break;
      case 4:
        this.router.navigate(['/admin/gestion-admins']);
        break;
      default:
        this.router.navigate(['/admin/gestion-usuarios']);
        break;
    }
  }

  onRolChange() {
    // Limpiar campos específicos al cambiar de rol si es necesario
    if (this.usuario.idRol !== '1') {
      this.usuario.grado = '';
      this.usuario.contacto_emergencia = '';
      this.usuario.telefono_contacto_emergencia = '';
    }
    if (this.usuario.idRol !== '2') {
      this.usuario.curso_asignado = '';
    }
    if (this.usuario.idRol !== '3') {
      this.usuario.nombre_estudiante_acargo = '';
      this.usuario.parentezco = '';
    }
    if (this.usuario.idRol !== '4') {
      this.usuario.cargo_admin = '';
    }
  }
    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        // Vista previa local
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.usuario.fotoPerfil = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
}
