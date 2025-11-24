"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const usersController_1 = require("../controllers/usersController");
const router = (0, express_1.Router)();
router.post('/upload-profile', auth_1.authenticateToken, upload_1.upload.single('fotoPerfil'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
});
// Ruta para obtener usuarios - Solo accesible para los roles 4
router.get('/', auth_1.authenticateToken, (0, authorize_1.authorizeRoles)(4), usersController_1.getUsers);
// Ruta para crear usuarios - Accesible para roles 1, 2, 3, 4
router.post('/', auth_1.authenticateToken, (0, authorize_1.authorizeRoles)(1, 2, 3, 4), usersController_1.createUser);
// Ruta para obtener usuario por correo - Accesible para roles 1, 2, 3, 4
router.get('/:correo', auth_1.authenticateToken, (0, authorize_1.authorizeRoles)(1, 2, 3, 4), usersController_1.getUserByEmail);
// Ruta para actualizar usuario por correo - Accesible para roles 1, 2, 3, 4
router.put('/:correo', auth_1.authenticateToken, (0, authorize_1.authorizeRoles)(1, 2, 3, 4), usersController_1.updateUser);
// Ruta para eliminar usuario por correo - Solo accesible para el rol 4 (administrador)
router.delete('/:correo', auth_1.authenticateToken, (0, authorize_1.authorizeRoles)(4), usersController_1.deleteUser);
exports.default = router;
