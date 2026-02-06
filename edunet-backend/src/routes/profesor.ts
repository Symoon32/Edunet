import { Router } from 'express';
import {
    getDashboard,
    getPerfil,
    updatePerfil,
    getHorario,
    getCursosProfesor,
    getEstudiantesPorCurso,
    getEstadisticasCurso,
    getReporteCurso,
    getReporteEstudiante
} from '../controllers/profesorController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();

// Middleware para verificar rol de profesor
router.use(authMiddleware);
router.use(authorizeRoles(2)); // 2 = profesor

// Rutas del dashboard y perfil
router.get('/dashboard/:idProfesor', getDashboard);
router.get('/perfil/:idProfesor', getPerfil);
router.put('/perfil/:idProfesor', updatePerfil);
router.get('/horario/:idProfesor', getHorario);

// 📊 Rutas de estadísticas y reportes
router.get('/cursos', getCursosProfesor); // Obtener cursos del profesor
router.get('/cursos/:idCurso/estudiantes', getEstudiantesPorCurso); // Estudiantes de un curso
router.get('/estadisticas/curso/:idCurso', getEstadisticasCurso); // Estadísticas generales del curso
router.get('/reportes/curso/:idCurso', getReporteCurso); // Reporte detallado del curso
router.get('/reportes/estudiante/:idEstudiante/curso/:idCurso', getReporteEstudiante); // Reporte individual

export default router;
