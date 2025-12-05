"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cursosController_1 = require("../controllers/cursosController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
const cursosController = new cursosController_1.CursosController();
router.use(auth_1.authMiddleware);
router.use((0, authorize_1.authorize)('profesor', 'administrador'));
// Rutas de gestión de cursos
router.post('/', cursosController.createCurso);
router.get('/profesor/:idProfesor', cursosController.getCursos);
router.get('/:idCurso', cursosController.getCurso);
router.put('/:idCurso', cursosController.updateCurso);
router.delete('/:idCurso', cursosController.deleteCurso);
// Rutas de gestión de estudiantes en cursos
router.get('/:idCurso/estudiantes', cursosController.getEstudiantesCurso);
router.post('/:idCurso/estudiantes', cursosController.addEstudianteCurso);
router.put('/:idCurso/estudiante/:idEstudiante/estado', cursosController.updateEstadoCursoEstudiante);
router.delete('/:idCurso/estudiante/:idEstudiante', cursosController.removeEstudianteCurso);
exports.default = router;
