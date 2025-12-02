import { Routes } from '@angular/router';
import { ProfesorGuard } from './profesor/guards/profesor.guard';
import { AdminGuard } from './admin/guards/admin.guard';
import { TutoresGuard } from './tutores/guards/tutores.guard';
import { EstudiantesGuard } from './estudiantes/guards/estudiante.guard';

export const routes: Routes = [
    {
        path: 'admin',
        loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [AdminGuard],
        children: [
            { path: 'inicio', loadComponent: () => import('./admin/inicio-admin.component').then(m => m.InicioAdminComponent) },
            { path: 'gestion-usuarios', loadComponent: () => import('./users/components/list-user/list-user').then(m => m.ListUser) },
            { path: 'gestion-estudiantes', loadComponent: () => import('./users/components/list-user/list-user').then(m => m.ListUser) },
            { path: 'gestion-profesores', loadComponent: () => import('./users/components/list-user/list-user').then(m => m.ListUser) },
            { path: 'gestion-admins', loadComponent: () => import('./users/components/list-user/list-user').then(m => m.ListUser) },
            { path: 'create-user', loadComponent: () => import('./users/components/create-edit-user/create-edit-user').then(m => m.CreateEditUser) },
            { path: 'edit-user/:correo', loadComponent: () => import('./users/components/create-edit-user/create-edit-user').then(m => m.CreateEditUser) },
            { path: 'config-cursos', loadComponent: () => import('./admin/configurar-cursos.component').then(m => m.ConfigurarCursosComponent) },
            { path: 'gestion-materias', loadComponent: () => import('./admin/gestion-materias.component').then(m => m.GestionMateriasComponent) },
            { path: 'reportes', loadComponent: () => import('./admin/reportes.component').then(m => m.ReportesComponent) },
            { path: 'estadisticas', loadComponent: () => import('./admin/estadisticas.component').then(m => m.EstadisticasComponent) },
            { path: 'comunicacion', loadComponent: () => import('./admin/comunicacion.component').then(m => m.ComunicacionComponent) },
            { path: 'anuncios-boletines', loadComponent: () => import('./admin/anuncios.component').then(m => m.AnunciosComponent) },
        ]
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./users/components/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./users/components/reset-password/reset-password').then(m => m.ResetPasswordComponent)
    },
    //Rutas para profesores
    {
        path: 'gestion-profesores',
        loadComponent: () => import('./profesor/components/list-profesor/list-profesor').then(m => m.ListProfesor)
    },
    {
        path: 'create-profesor',
        loadComponent: () => import('./profesor/components/create-edit-profesor/create-edit-profesor').then(m => m.CreateEditProfesor)
    },
    {
        path: 'edit-profesor/:id',
        loadComponent: () => import('./profesor/components/create-edit-profesor/create-edit-profesor').then(m => m.CreateEditProfesor)
    },
    {
        path: 'profesor',
        loadComponent: () => import('./profesor/pages/profesor-home/profesor-home').then(m => m.ProfesorHome),
        canActivate: [ProfesorGuard]
    },
    {
        path: 'profesor/calificar',
        loadComponent: () => import('./profesor/pages/calificar-materias/calificar-materias').then(m => m.CalificarMaterias),
        canActivate: [ProfesorGuard]
    },
    {
        path: 'profesor/cargar-notas',
        loadComponent: () => import('./profesor/pages/cargar-notas/cargar-notas').then(m => m.CargarNotas),
        canActivate: [ProfesorGuard]
    },
    {
        path: 'profesor/estadisticas',
        loadComponent: () => import('./profesor/pages/estadisticas/estadisticas-profesor').then(m => m.EstadisticasProfesor),
        canActivate: [ProfesorGuard]
    },
    {
        path: 'profesor/reportes',
        loadComponent: () => import('./profesor/pages/reportes/reportes').then(m => m.Reportes),
        canActivate: [ProfesorGuard]
    },
    {
        path: 'profesor/gestion-clase',
        loadComponent: () => import('./profesor/pages/gestion-clase/gestion-clase').then(m => m.GestionClase),
        canActivate: [ProfesorGuard]
    },
    {
        path: 'profesor/materiales/:idCurso',
        loadComponent: () => import('./profesor/pages/materiales/materiales.component').then(m => m.MaterialesComponent),
        canActivate: [ProfesorGuard]
    },
    {
        path: 'profesor/comunicacion',
        loadComponent: () => import('./profesor/pages/comunicacion/comunicacion.component').then(m => m.ComunicacionProfesorComponent),
        canActivate: [ProfesorGuard]
    },
    {
        path: 'profesor/asistencia/:idClase',
        loadComponent: () => import('./profesor/pages/asistencia/asistencia.component').then(m => m.AsistenciaComponent),
        canActivate: [ProfesorGuard]
    },
    {
      path: '',
      loadComponent: () => import('./users/components/login/login.component').then(m => m.LoginComponent)
    },
    // Rutas para tutores
    {
        path: 'tutores',
        loadComponent: () => import('./tutores/inicio-tutores.component').then(m => m.InicioTutoresComponent),
        canActivate: [TutoresGuard]
    },
    {
        path: 'tutores/comunicacion',
        loadComponent: () => import('./tutores/comunicacion-tutores.component').then(m => m.ComunicacionTutoresComponent),
        canActivate: [TutoresGuard]
    },
    {
        path: 'tutores/calendario',
        loadComponent: () => import('./tutores/calendario-tutores.component').then(m => m.CalendarioTutoresComponent),
        canActivate: [TutoresGuard]
    },
    {
        path: 'tutores/notas',
        loadComponent: () => import('./tutores/notas-tutores.component').then(m => m.NotasTutoresComponent),
        canActivate: [TutoresGuard]
    },
    {
        path: 'tutores/observaciones',
        loadComponent: () => import('./tutores/observaciones-tutores.component').then(m => m.ObservacionesTutoresComponent),
        canActivate: [TutoresGuard]
    },
    {
        path: 'estudiantes',
        loadComponent: () => import('./estudiantes/inicio-estudiantes.component').then(m => m.InicioEstudiantesComponent),
        canActivate: [EstudiantesGuard]
    },
    {
        path: 'estudiantes/perfil',
        loadComponent: () => import('./estudiantes/perfil-estudiante.component').then(m => m.PerfilEstudianteComponent),
        canActivate: [EstudiantesGuard]
    },
    {
        path: 'estudiantes/historial',
        loadComponent: () => import('./estudiantes/historial-estudiantes.component').then(m => m.HistorialEstudiantesComponent),
        canActivate: [EstudiantesGuard]
    },
    {
        path: 'estudiantes/material',
        loadComponent: () => import('./estudiantes/materiales-estudiantes.component').then(m => m.MaterialesEstudiantesComponent),
        canActivate: [EstudiantesGuard]
    },
    {
        path: 'estudiantes/tareas',
        loadComponent: () => import('./estudiantes/tareas-estudiantes.component').then(m => m.TareasEstudiantesComponent),
        canActivate: [EstudiantesGuard]
    },
    {
        path: 'estudiantes/calendario',
        loadComponent: () => import('./estudiantes/calendario-estudiantes.component').then(m => m.CalendarioEstudiantesComponent),
        canActivate: [EstudiantesGuard]
    },
    {
        path: 'estudiantes/mensajes',
        loadComponent: () => import('./estudiantes/mensajes/mensajes-estudiantes.component').then(m => m.MensajesEstudiantesComponent),
        canActivate: [EstudiantesGuard]
    }
    
];
