import { Router } from 'express';
import { MaterialesController } from '../controllers/materialesController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles, authorize } from '../middleware/authorize';

const router = Router();
const materialesController = new MaterialesController();

router.use(authMiddleware);

// Todos pueden ver materiales si tienen acceso al curso (simplificación, idealmente chequear inscripción)
router.get('/curso/:idCurso', materialesController.getMaterialesCurso);

// Solo profes y admin pueden crear/borrar
router.post('/', authorize('profesor', 'administrador'), materialesController.createMaterial);
router.delete('/:idMaterial', authorize('profesor', 'administrador'), materialesController.deleteMaterial);

export default router;
