import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import {
    createMateria,
    getMaterias,
    updateMateria,
    deleteMateria
} from '../controllers/materiasController';

const router = Router();

// All routes in this file should be protected and only accessible by administrators.
router.use(authenticateToken, authorizeRoles(4));

router.post('/', createMateria);
router.get('/', getMaterias);
router.put('/:idMateria', updateMateria);
router.delete('/:idMateria', deleteMateria);

export default router;
