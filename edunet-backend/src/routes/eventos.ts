import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    createEvento,
    getEventos,
    updateEvento,
    deleteEvento
} from '../controllers/eventosController';

const router = Router();

router.use(authMiddleware);

router.get('/', getEventos);

// Solo admin (rol 4) pueden crear, actualizar y eliminar eventos.
router.post('/', authorizeRoles(4), createEvento);
router.put('/:idEvento', authorizeRoles(4), updateEvento);
router.delete('/:idEvento', authorizeRoles(4), deleteEvento);

export default router;
