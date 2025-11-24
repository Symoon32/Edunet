import { Router } from 'express';
import { ProfesorController } from '../controllers/profesorController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
const profesorController = new ProfesorController();

// Middleware para verificar rol de profesor
router.use(authMiddleware);
router.use(authorize('profesor'));

// Rutas del dashboard y perfil
router.get('/dashboard/:idProfesor', profesorController.getDashboard);
router.get('/perfil/:idProfesor', profesorController.getPerfil);
router.put('/perfil/:idProfesor', profesorController.updatePerfil);
router.get('/horario/:idProfesor', profesorController.getHorario);

export default router;