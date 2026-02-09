import { Router } from 'express';
import { MensajesController } from '../controllers/mensajesController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const mensajesController = new MensajesController();

router.use(authMiddleware);

router.post('/', (req, res) => mensajesController.sendMessage(req, res));
router.get('/recibidos', (req, res) => mensajesController.getReceivedMessages(req, res));
router.get('/enviados', (req, res) => mensajesController.getSentMessages(req, res));
router.put('/:idMensaje/leer', (req, res) => mensajesController.markAsRead(req, res));

export default router;
