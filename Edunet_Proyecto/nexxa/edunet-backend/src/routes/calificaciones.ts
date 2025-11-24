import { Router } from 'express';
import { CalificacionesController } from '../controllers/calificacionesController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
const calificacionesController = new CalificacionesController();

// Middleware de autenticación y autorización
router.use(authMiddleware);
router.use(authorize('profesor', 'administrador'));

// Rutas
router.get('/curso/:idCurso', calificacionesController.getCalificacionesCurso);
router.get('/curso/:idCurso/estudiante/:idEstudiante', calificacionesController.getCalificacionesEstudiante);
router.post('/', calificacionesController.createCalificacion);
router.put('/:idCalificacion', calificacionesController.updateCalificacion);
router.delete('/:idCalificacion', calificacionesController.deleteCalificacion);
router.get('/curso/:idCurso/promedio', calificacionesController.getPromedioCurso);

export default router;