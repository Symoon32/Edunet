import { Router } from 'express';
import { ClasesController } from '../controllers/clasesController';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';

const router = Router();
const clasesController = new ClasesController();

// Middleware de autenticación y autorización
router.use(authMiddleware);
router.use(authorizeRoles(2, 4));

// Rutas
router.post('/', clasesController.createClase);
router.get('/curso/:idCurso', clasesController.getClasesCurso);
router.get('/:idClase', clasesController.getClase);
router.put('/:idClase', clasesController.updateClase);
router.delete('/:idClase', clasesController.deleteClase);

export default router;