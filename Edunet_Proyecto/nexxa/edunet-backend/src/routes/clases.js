"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clasesController_1 = require("../controllers/clasesController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const clasesController = new clasesController_1.ClasesController();
// Middleware de autenticación y autorización
router.use(auth_1.authMiddleware);
router.use((0, authorize_1.authorize)('profesor', 'administrador'));
// Rutas
router.post('/', clasesController.createClase);
router.get('/curso/:idCurso', clasesController.getClasesCurso);
router.get('/:idClase', clasesController.getClase);
router.put('/:idClase', clasesController.updateClase);
router.delete('/:idClase', clasesController.deleteClase);
exports.default = router;
