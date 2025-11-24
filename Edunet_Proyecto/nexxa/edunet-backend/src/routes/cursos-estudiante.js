"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cursos_estudiante_1 = require("../controllers/cursos-estudiante");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const cursosEstudianteController = new cursos_estudiante_1.CursosEstudianteController();
// Middleware de autenticación y autorización
router.use(auth_1.authMiddleware);
router.use((0, authorize_1.authorize)('estudiante'));
// Rutas específicas para estudiantes
router.get('/mis-cursos', cursosEstudianteController.getMisCursos);
router.get('/:idCurso/clases', cursosEstudianteController.getClasesCursoEstudiante);
exports.default = router;
