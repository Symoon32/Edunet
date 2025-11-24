import { Router } from 'express';
import { EventosController } from '../controllers/eventosController';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();
const eventosController = new EventosController();

router.use(authMiddleware);

router.get('/', eventosController.getEventos);

// Solo admin (y quizás profesor) pueden gestionar eventos
router.post('/', authorize('administrador', 'profesor'), eventosController.createEvento);
router.delete('/:idEvento', authorize('administrador', 'profesor'), eventosController.deleteEvento);

export default router;
