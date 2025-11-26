
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  usuario: any = {
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    documento: '',
    direccion: '',
    fotoPerfil: '',
    password: '',
    rol: '',
    grado: '',
    contacto_emergencia: '',
    telefono_contacto_emergencia: '',
    curso_asignado: '',
    estudiante_relacionado: '',
    parentesco: '',
    cargo: ''
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
  const guardarUsuario = () => {
    if (this.editMode) {
      // No enviar campo correo en el body, solo los editables
      const usuarioEdit = { ...this.usuario };
      delete usuarioEdit.correo;
      if (!usuarioEdit.password) delete usuarioEdit.password;

      this.userService.updateUser(this.usuario.correo, usuarioEdit).subscribe({
        next: () => {
          alert('Usuario actualizado correctamente');
          this.router.navigate(['/']);
        },
        error: (err) => {
          alert('Error al actualizar usuario: ' + (err.error?.error || 'Error desconocido'));
        }
      });
    } else {
      this.userService.createUser(this.usuario).subscribe({
        next: () => {
          alert('Usuario registrado correctamente');
          this.resetUsuario(); // método para limpiar el objeto
        },
        error: (err) => {
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
      error: () => {
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
    rol: '',
    grado: '',
    contacto_emergencia: '',
    telefono_contacto_emergencia: '',
    curso_asignado: '',
    estudiante_relacionado: '',
    parentesco: '',
    cargo: ''
  };
}

  onRolChange() {
    // Limpiar campos específicos al cambiar de rol si es necesario
    if (this.usuario.rol !== '1') {
      this.usuario.grado = '';
      this.usuario.contacto_emergencia = '';
      this.usuario.telefono_contacto_emergencia = '';
    }
    if (this.usuario.rol !== '2') {
      this.usuario.curso_asignado = '';
    }
    if (this.usuario.rol !== '3') {
      this.usuario.estudiante_relacionado = '';
      this.usuario.parentesco = '';
    }
    if (this.usuario.rol !== '4') {
      this.usuario.cargo = '';
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
