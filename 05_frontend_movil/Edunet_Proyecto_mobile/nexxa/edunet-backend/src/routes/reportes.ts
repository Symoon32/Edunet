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
router.post('/curso/:idCurso/rendimiento', reportesController.generarReporteRendimiento);
router.get('/:idReporte', reportesController.getReporte);
router.get('/curso/:idCurso', reportesController.getReportesCurso);
router.delete('/:idReporte', reportesController.deleteReporte);

export default router;