import { Router } from 'express';
import { CalificacionesController } from '../controllers/calificacionesController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();
const calificacionesController = new CalificacionesController();

// Middleware de autenticación y autorización
router.use(authMiddleware);

// Rutas
// Consultar todas las calificaciones de un curso (Profesor, Admin)
router.get('/curso/:idCurso', authorize('profesor', 'administrador'), calificacionesController.getCalificacionesCurso);

// Consultar calificaciones de un estudiante (Profesor, Admin, Estudiante, Acudiente)
// El controlador debe verificar que el estudiante/acudiente solo vea las suyas
router.get('/curso/:idCurso/estudiante/:idEstudiante', authorize('profesor', 'administrador', 'estudiante', 'acudiente'), calificacionesController.getCalificacionesEstudiante);

// CRUD (Profesor, Admin)
router.post('/', authorize('profesor', 'administrador'), calificacionesController.createCalificacion);
router.put('/:idCalificacion', authorize('profesor', 'administrador'), calificacionesController.updateCalificacion);
router.delete('/:idCalificacion', authorize('profesor', 'administrador'), calificacionesController.deleteCalificacion);
router.get('/curso/:idCurso/promedio', authorize('profesor', 'administrador'), calificacionesController.getPromedioCurso);

export default router;