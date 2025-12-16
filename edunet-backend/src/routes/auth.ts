
import { Router } from 'express';
import { login, forgotPassword, resetPassword, register } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


router.get('/me', authenticateToken, (req: any, res) => {
	res.json({ user: req.user });
});

export default router;
