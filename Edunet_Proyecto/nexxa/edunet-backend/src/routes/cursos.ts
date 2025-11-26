import { Router } from 'express';
import {
    createCurso,
    getCursos,
    getCurso,
    updateCurso,
    deleteCurso,
    getEstudiantesCurso,
    addEstudianteCurso,
    updateEstadoCursoEstudiante,
    removeEstudianteCurso,
    assignProfesorToCurso,
    assignStudentToCurso
} from '../controllers/cursosController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';


const router = Router();

// Middleware for authentication
router.use(authMiddleware);

// Routes for admins and professors
const generalRoles = [2, 4];
router.post('/', authorizeRoles(...generalRoles), createCurso);
router.get('/profesor/:idProfesor', authorizeRoles(...generalRoles), getCursos);
router.get('/:idCurso', authorizeRoles(...generalRoles), getCurso);
router.put('/:idCurso', authorizeRoles(...generalRoles), updateCurso);
router.delete('/:idCurso', authorizeRoles(...generalRoles), deleteCurso);
router.get('/:idCurso/estudiantes', authorizeRoles(...generalRoles), getEstudiantesCurso);
router.post('/:idCurso/estudiantes', authorizeRoles(...generalRoles), addEstudianteCurso);
router.put('/:idCurso/estudiante/:idEstudiante/estado', authorizeRoles(...generalRoles), updateEstadoCursoEstudiante);
router.delete('/:idCurso/estudiante/:idEstudiante', authorizeRoles(...generalRoles), removeEstudianteCurso);

// Admin-only routes
router.post('/admin/assign-profesor', authorizeRoles(4), assignProfesorToCurso);
router.post('/:idCurso/admin/assign-student', authorizeRoles(4), addEstudianteCurso);


export default router;