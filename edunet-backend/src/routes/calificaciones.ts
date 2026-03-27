import { Router } from 'express';
import { CalificacionesController } from '../controllers/calificacionesController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles, authorize } from '../middleware/authorize';

const router = Router();
const calificacionesController = new CalificacionesController();

// Middleware de autenticación y autorización
router.use(authMiddleware);

// Rutas
// Consultar todas las calificaciones de un curso (Profesor, Admin)
router.get('/curso/:idCurso', authorize('profesor', 'administrador'), (req, res) => calificacionesController.getCalificacionesCurso(req, res));

// Consultar calificaciones de un estudiante (Profesor, Admin, Estudiante, Acudiente)
// El controlador debe verificar que el estudiante/acudiente solo vea las suyas
router.get('/curso/:idCurso/estudiante/:idEstudiante', authorize('profesor', 'administrador', 'estudiante', 'acudiente'), (req, res) => calificacionesController.getCalificacionesEstudiante(req, res));

// CRUD (Profesor, Admin)
router.post('/', authorize('profesor', 'administrador'), (req, res) => calificacionesController.createCalificacion(req, res));
router.put('/:idCalificacion', authorize('profesor', 'administrador'), (req, res) => calificacionesController.updateCalificacion(req, res));
router.delete('/:idCalificacion', authorize('profesor', 'administrador'), (req, res) => calificacionesController.deleteCalificacion(req, res));
router.get('/curso/:idCurso/promedio', authorize('profesor', 'administrador'), (req, res) => calificacionesController.getPromedioCurso(req, res));

export default router;