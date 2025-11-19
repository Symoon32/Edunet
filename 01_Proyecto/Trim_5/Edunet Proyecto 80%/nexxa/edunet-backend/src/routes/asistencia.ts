import { Router } from 'express';
import { AsistenciaController } from '../controllers/asistenciaController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
const asistenciaController = new AsistenciaController();

// Middleware de autenticación y autorización
router.use(authMiddleware);
router.use(authorize('profesor', 'administrador'));

// Rutas
router.post('/clase/:idClase', (req, res) => asistenciaController.registrarAsistencia(req, res));
router.get('/clase/:idClase', (req, res) => asistenciaController.getAsistenciaClase(req, res));
router.get('/estudiante/:idEstudiante/curso/:idCurso', (req, res) => asistenciaController.getAsistenciaEstudianteCurso(req, res));
router.get('/curso/:idCurso/reporte', (req, res) => asistenciaController.getReporteAsistenciaCurso(req, res));
// Alias para compatibilidad: /resumen -> /reporte
router.get('/curso/:idCurso/resumen', (req, res) => asistenciaController.getReporteAsistenciaCurso(req, res));
router.put('/:idAsistencia', (req, res) => asistenciaController.updateAsistencia(req, res));

export default router;