"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportesController_1 = require("../controllers/reportesController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const reportesController = new reportesController_1.ReportesController();
// Middleware de autenticación y autorización
router.use(auth_1.authMiddleware);
router.use((0, authorize_1.authorize)('profesor', 'administrador'));
// Rutas
router.post('/curso/:idCurso/rendimiento', reportesController.generarReporteRendimiento);
router.get('/:idReporte', reportesController.getReporte);
router.get('/curso/:idCurso', reportesController.getReportesCurso);
router.delete('/:idReporte', reportesController.deleteReporte);
exports.default = router;
