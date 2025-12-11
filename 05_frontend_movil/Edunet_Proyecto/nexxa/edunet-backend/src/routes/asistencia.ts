import { Router } from 'express';
import { AsistenciaController } from '../controllers/asistenciaController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles, authorize } from '../middleware/authorize';

const router = Router();
const asistenciaController = new AsistenciaController();

// Middleware de autenticación y autorización
router.use(authMiddleware);

// Rutas
// Profesor / Admin
router.post('/', authorize('profesor', 'administrador'), (req, res) => asistenciaController.registrarAsistenciaQr(req, res));
router.post('/clase/:idClase', authorize('profesor', 'administrador'), (req, res) => asistenciaController.registrarAsistencia(req, res));
router.get('/clase/:idClase', authorize('profesor', 'administrador'), (req, res) => asistenciaController.getAsistenciaClase(req, res));
router.get('/curso/:idCurso/reporte', authorize('profesor', 'administrador'), (req, res) => asistenciaController.getReporteAsistenciaCurso(req, res));
router.get('/curso/:idCurso/resumen', authorize('profesor', 'administrador'), (req, res) => asistenciaController.getReporteAsistenciaCurso(req, res));
router.put('/:idAsistencia', authorize('profesor', 'administrador'), (req, res) => asistenciaController.updateAsistencia(req, res));

// Estudiante / Acudiente / Profesor / Admin
router.get('/estudiante/:idEstudiante/curso/:idCurso', authorize('profesor', 'administrador', 'estudiante', 'acudiente'), (req, res) => asistenciaController.getAsistenciaEstudianteCurso(req, res));

export default router;