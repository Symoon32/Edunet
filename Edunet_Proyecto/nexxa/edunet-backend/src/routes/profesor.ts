import { Router } from 'express';
import { getDashboard, getPerfil, updatePerfil, getHorario } from '../controllers/profesorController';
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

export default router;