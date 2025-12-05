"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profesorController_1 = require("../controllers/profesorController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const profesorController = new profesorController_1.ProfesorController();
// Middleware para verificar rol de profesor
router.use(auth_1.authMiddleware);
router.use((0, authorize_1.authorize)('profesor'));
// Rutas del dashboard y perfil
router.get('/dashboard/:idProfesor', profesorController.getDashboard);
router.get('/perfil/:idProfesor', profesorController.getPerfil);
router.put('/perfil/:idProfesor', profesorController.updatePerfil);
router.get('/horario/:idProfesor', profesorController.getHorario);
exports.default = router;
