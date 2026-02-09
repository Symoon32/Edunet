import { Router } from 'express';
import { CursosEstudianteController } from '../controllers/cursos-estudiante';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();
const cursosEstudianteController = new CursosEstudianteController();

// Middleware de autenticación y autorización
router.use(authMiddleware);
router.use(authorizeRoles(1));

// Rutas específicas para estudiantes
router.get('/mis-cursos', (req, res) => cursosEstudianteController.getMisCursos(req, res));
router.get('/:idCurso/clases', (req, res) => cursosEstudianteController.getClasesCursoEstudiante(req, res));

export default router;