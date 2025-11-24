"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const materialesController_1 = require("../controllers/materialesController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const materialesController = new materialesController_1.MaterialesController();
router.use(auth_1.authMiddleware);
// Todos pueden ver materiales si tienen acceso al curso (simplificación, idealmente chequear inscripción)
router.get('/curso/:idCurso', materialesController.getMaterialesCurso);
// Solo profes y admin pueden crear/borrar
router.post('/', (0, authorize_1.authorize)('profesor', 'administrador'), materialesController.createMaterial);
router.delete('/:idMaterial', (0, authorize_1.authorize)('profesor', 'administrador'), materialesController.deleteMaterial);
exports.default = router;
