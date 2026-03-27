import { Router } from 'express';
import { MaterialesController } from '../controllers/materialesController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles, authorize } from '../middleware/authorize';

const router = Router();
const materialesController = new MaterialesController();

router.use(authMiddleware);

// Todos pueden ver materiales si tienen acceso al curso (simplificación, idealmente chequear inscripción)
router.get('/curso/:idCurso', (req, res) => materialesController.getMaterialesCurso(req, res));

// Solo profes y admin pueden crear/borrar
router.post('/', authorize('profesor', 'administrador'), (req, res) => materialesController.createMaterial(req, res));
router.delete('/:idMaterial', authorize('profesor', 'administrador'), (req, res) => materialesController.deleteMaterial(req, res));

export default router;
