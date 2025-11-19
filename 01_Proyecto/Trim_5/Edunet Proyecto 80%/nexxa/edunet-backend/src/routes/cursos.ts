import { Router } from 'express';
import { CursosController } from '../controllers/cursosController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
const cursosController = new CursosController();

router.use(authMiddleware);
router.use(authorize('profesor', 'administrador'));

// Rutas de gestión de cursos
router.post('/', cursosController.createCurso);
router.get('/profesor/:idProfesor', cursosController.getCursos);
router.get('/:idCurso', cursosController.getCurso);
router.put('/:idCurso', cursosController.updateCurso);
router.delete('/:idCurso', cursosController.deleteCurso);

// Rutas de gestión de estudiantes en cursos
router.get('/:idCurso/estudiantes', cursosController.getEstudiantesCurso);
router.post('/:idCurso/estudiantes', cursosController.addEstudianteCurso);
router.put('/:idCurso/estudiante/:idEstudiante/estado', cursosController.updateEstadoCursoEstudiante);
router.delete('/:idCurso/estudiante/:idEstudiante', cursosController.removeEstudianteCurso);

export default router;