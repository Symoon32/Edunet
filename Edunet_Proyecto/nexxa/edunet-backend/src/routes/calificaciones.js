"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calificacionesController_1 = require("../controllers/calificacionesController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const calificacionesController = new calificacionesController_1.CalificacionesController();
// Middleware de autenticación y autorización
router.use(auth_1.authMiddleware);
// Rutas
// Consultar todas las calificaciones de un curso (Profesor, Admin)
router.get('/curso/:idCurso', (0, authorize_1.authorize)('profesor', 'administrador'), calificacionesController.getCalificacionesCurso);
// Consultar calificaciones de un estudiante (Profesor, Admin, Estudiante, Acudiente)
// El controlador debe verificar que el estudiante/acudiente solo vea las suyas
router.get('/curso/:idCurso/estudiante/:idEstudiante', (0, authorize_1.authorize)('profesor', 'administrador', 'estudiante', 'acudiente'), calificacionesController.getCalificacionesEstudiante);
// CRUD (Profesor, Admin)
router.post('/', (0, authorize_1.authorize)('profesor', 'administrador'), calificacionesController.createCalificacion);
router.put('/:idCalificacion', (0, authorize_1.authorize)('profesor', 'administrador'), calificacionesController.updateCalificacion);
router.delete('/:idCalificacion', (0, authorize_1.authorize)('profesor', 'administrador'), calificacionesController.deleteCalificacion);
router.get('/curso/:idCurso/promedio', (0, authorize_1.authorize)('profesor', 'administrador'), calificacionesController.getPromedioCurso);
exports.default = router;
