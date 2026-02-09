import { Router } from 'express';
import { ReportesController } from '../controllers/reportesController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();
const reportesController = new ReportesController();

// Middleware de autenticación y autorización
router.use(authMiddleware);
router.use(authorizeRoles(2, 4));

// Rutas
router.post('/curso/:idCurso/rendimiento', (req, res) => reportesController.generarReporteRendimiento(req, res));
router.get('/:idReporte', (req, res) => reportesController.getReporte(req, res));
router.get('/curso/:idCurso', (req, res) => reportesController.getReportesCurso(req, res));
router.delete('/:idReporte', (req, res) => reportesController.deleteReporte(req, res));

export default router;