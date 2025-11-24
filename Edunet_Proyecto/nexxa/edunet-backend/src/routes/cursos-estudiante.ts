import { Router } from 'express';
import { CursosEstudianteController } from '../controllers/cursos-estudiante';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
const cursosEstudianteController = new CursosEstudianteController();

// Middleware de autenticación y autorización
router.use(authMiddleware);
router.use(authorize('estudiante'));

// Rutas específicas para estudiantes
router.get('/mis-cursos', cursosEstudianteController.getMisCursos);
router.get('/:idCurso/clases', cursosEstudianteController.getClasesCursoEstudiante);

export default router;