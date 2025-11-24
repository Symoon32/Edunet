"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursosEstudianteController = void 0;
const connection_1 = require("../db/connection");
class CursosEstudianteController {
    // Obtener cursos del estudiante autenticado
    getMisCursos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const idEstudiante = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const [cursos] = yield connection_1.connection.execute(`SELECT c.*, m.nombre as materia, m.codigo,
                u.nombres as nombreProfesor, u.apellidos as apellidosProfesor,
                ce.estado, ce.fechaInscripcion
         FROM curso_estudiante ce
         INNER JOIN cursos c ON ce.idCurso = c.idCurso
         INNER JOIN materias m ON c.idMateria = m.idMateria
         INNER JOIN usuarios u ON c.idProfesor = u.idUsuarios
         WHERE ce.idEstudiante = ?`, [idEstudiante]);
                res.json(cursos);
            }
            catch (error) {
                console.error('Error en getMisCursos:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener clases de un curso específico para el estudiante
    getClasesCursoEstudiante(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const idEstudiante = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { idCurso } = req.params;
                // Verificar que el estudiante está inscrito en el curso
                const [inscripcion] = yield connection_1.connection.execute('SELECT estado FROM curso_estudiante WHERE idCurso = ? AND idEstudiante = ?', [idCurso, idEstudiante]);
                if (!inscripcion[0]) {
                    return res.status(403).json({
                        message: 'No tienes acceso a este curso'
                    });
                }
                // Obtener las clases
                // Obtener las clases
                const [clases] = yield connection_1.connection.execute(`SELECT *
         FROM clases
         WHERE idCurso = ?
         ORDER BY fecha DESC, hora_inicio`, [idCurso]);
                res.json(clases);
            }
            catch (error) {
                console.error('Error en getClasesCursoEstudiante:', error);
                res.status(500).json({
                    message: 'Error interno del servidor',
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }
}
exports.CursosEstudianteController = CursosEstudianteController;
