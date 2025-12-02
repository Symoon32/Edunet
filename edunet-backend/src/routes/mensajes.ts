import { Router } from 'express';
import { MensajesController } from '../controllers/mensajesController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const mensajesController = new MensajesController();

router.use(authMiddleware);

router.post('/', mensajesController.sendMessage);
router.get('/recibidos', mensajesController.getReceivedMessages);
router.get('/enviados', mensajesController.getSentMessages);
router.put('/:idMensaje/leer', mensajesController.markAsRead);

export default router;
