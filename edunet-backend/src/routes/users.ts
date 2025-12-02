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

/**
 * @swagger
 * /api/users/upload-profile:
 *   post:
 *     summary: Subir foto de perfil
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fotoPerfil:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen (JPG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Foto subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: /uploads/1234567890-foto.jpg
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/upload-profile', authenticateToken, upload.single('fotoPerfil'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo accesible para administradores (rol 4)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', authenticateToken, authorizeRoles(4), getUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Accesible para todos los roles autenticados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authenticateToken, authorizeRoles(1, 2, 3, 4), createUser);

/**
 * @swagger
 * /api/users/{correo}:
 *   get:
 *     summary: Obtener usuario por correo electrónico
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Correo electrónico del usuario
 *         example: usuario@edunet.com
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:correo', authenticateToken, authorizeRoles(1, 2, 3, 4), getUserByEmail);

/**
 * @swagger
 * /api/users/{correo}:
 *   put:
 *     summary: Actualizar usuario por correo electrónico
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Correo electrónico del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:correo', authenticateToken, authorizeRoles(1, 2, 3, 4), updateUser);

/**
 * @swagger
 * /api/users/{correo}:
 *   delete:
 *     summary: Eliminar usuario por correo electrónico
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo accesible para administradores (rol 4)
 *     parameters:
 *       - in: path
 *         name: correo
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Correo electrónico del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:correo', authenticateToken, authorizeRoles(4), deleteUser);

/**
 * @swagger
 * /api/users/mis-estudiantes/list:
 *   get:
 *     summary: Obtener estudiantes asignados a un acudiente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     description: Solo accesible para acudientes (rol 3)
 *     responses:
 *       200:
 *         description: Lista de estudiantes asignados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/mis-estudiantes/list', authenticateToken, authorizeRoles(3), getMisEstudiantes);

export default router;
