"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asistenciaController_1 = require("../controllers/asistenciaController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const asistenciaController = new asistenciaController_1.AsistenciaController();
// Middleware de autenticación y autorización
router.use(auth_1.authMiddleware);
// Rutas
// Profesor / Admin
router.post('/clase/:idClase', (0, authorize_1.authorize)('profesor', 'administrador'), (req, res) => asistenciaController.registrarAsistencia(req, res));
router.get('/clase/:idClase', (0, authorize_1.authorize)('profesor', 'administrador'), (req, res) => asistenciaController.getAsistenciaClase(req, res));
router.get('/curso/:idCurso/reporte', (0, authorize_1.authorize)('profesor', 'administrador'), (req, res) => asistenciaController.getReporteAsistenciaCurso(req, res));
router.get('/curso/:idCurso/resumen', (0, authorize_1.authorize)('profesor', 'administrador'), (req, res) => asistenciaController.getReporteAsistenciaCurso(req, res));
router.put('/:idAsistencia', (0, authorize_1.authorize)('profesor', 'administrador'), (req, res) => asistenciaController.updateAsistencia(req, res));
// Estudiante / Acudiente / Profesor / Admin
router.get('/estudiante/:idEstudiante/curso/:idCurso', (0, authorize_1.authorize)('profesor', 'administrador', 'estudiante', 'acudiente'), (req, res) => asistenciaController.getAsistenciaEstudianteCurso(req, res));
exports.default = router;
