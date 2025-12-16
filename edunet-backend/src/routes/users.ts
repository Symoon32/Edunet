import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import { Router } from 'express';
import { upload } from '../middleware/upload';
import {
  getUsers,
  createUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  getMisEstudiantes
} from '../controllers/usersController';

const router = Router();


router.post('/upload-profile', authenticateToken, upload.single('fotoPerfil'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Ruta para obtener usuarios - Solo accesible para los roles 4
router.get('/', authenticateToken, authorizeRoles(4), getUsers);
// Ruta para crear usuarios - Solo accesible para el rol 4 (administrador)
router.post('/', authenticateToken, authorizeRoles(4), createUser);
// Ruta para obtener usuario por correo - Accesible para roles 1, 2, 3, 4
router.get('/:correo', authenticateToken, authorizeRoles(1, 2, 3, 4), getUserByEmail);
// Ruta para actualizar usuario por correo - Accesible para roles 1, 2, 3, 4
router.put('/:correo', authenticateToken, authorizeRoles(1, 2, 3, 4), updateUser);
// Ruta para eliminar usuario por correo - Solo accesible para el rol 4 (administrador)
router.delete('/:correo', authenticateToken, authorizeRoles(4), deleteUser);

// Ruta para obtener estudiantes asignados a un padre - Accesible para rol 3 (acudiente)
router.get('/mis-estudiantes/list', authenticateToken, authorizeRoles(3), getMisEstudiantes);

export default router;
