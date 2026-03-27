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
router.post('/', (req, res) => clasesController.createClase(req, res));
router.get('/curso/:idCurso', (req, res) => clasesController.getClasesCurso(req, res));
router.get('/:idClase', (req, res) => clasesController.getClase(req, res));
router.put('/:idClase', (req, res) => clasesController.updateClase(req, res));
router.delete('/:idClase', (req, res) => clasesController.deleteClase(req, res));

export default router;