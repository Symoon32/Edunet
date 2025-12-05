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
exports.CursosController = void 0;
const connection_1 = require("../db/connection");
class CursosController {
    // Crear nuevo curso
    createCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idMateria, idProfesor, periodo, anio, grado, seccion } = req.body;
                // Validar datos requeridos
                if (!idMateria || !idProfesor || !periodo || !anio || !grado || !seccion) {
                    return res.status(400).json({
                        message: 'Datos incompletos',
                        required: ['idMateria', 'idProfesor', 'periodo', 'anio', 'grado', 'seccion']
                    });
                }
                yield conn.beginTransaction();
                // Verificar que la materia existe
                const [materia] = yield conn.execute('SELECT idMateria FROM materias WHERE idMateria = ?', [idMateria]);
                if (!materia[0]) {
                    yield conn.rollback();
                    return res.status(404).json({ message: 'Materia no encontrada' });
                }
                // Verificar que el profesor existe y es profesor
                const [profesor] = yield conn.execute(`SELECT u.idUsuarios FROM usuarios u
         INNER JOIN roles r ON u.idRol = r.idRol
         WHERE u.idUsuarios = ? AND r.nombreRol = 'profesor'`, [idProfesor]);
                if (!profesor[0]) {
                    yield conn.rollback();
                    return res.status(404).json({ message: 'Profesor no encontrado' });
                }
                // Crear el curso (ajustado al esquema existente)
                const [result] = yield conn.execute(`INSERT INTO cursos (idMateria, idProfesor, periodo, anio, grado, seccion)
         VALUES (?, ?, ?, ?, ?, ?)`, [idMateria, idProfesor, periodo, anio, grado, seccion]);
                yield conn.commit();
                res.status(201).json({
                    message: 'Curso creado correctamente',
                    idCurso: result.insertId
                });
            }
            catch (error) {
                yield conn.rollback();
                console.error('Error en createCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
            finally {
                conn.release();
            }
        });
    }
    // Obtener todos los cursos de un profesor
    getCursos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idProfesor } = req.params;
                const [rows] = yield connection_1.connection.execute(`SELECT c.*, m.nombre as materia, m.codigo,
                COUNT(DISTINCT ce.idEstudiante) as totalEstudiantes
         FROM cursos c
         INNER JOIN materias m ON c.idMateria = m.idMateria
         LEFT JOIN curso_estudiante ce ON c.idCurso = ce.idCurso
         WHERE c.idProfesor = ?
         GROUP BY c.idCurso`, [idProfesor]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getCursos:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener detalle de un curso específico
    getCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso } = req.params;
                const [curso] = yield connection_1.connection.execute(`SELECT c.*, m.nombre as materia, m.codigo, m.descripcion
         FROM cursos c
         INNER JOIN materias m ON c.idMateria = m.idMateria
         WHERE c.idCurso = ?`, [idCurso]);
                if (!curso[0]) {
                    return res.status(404).json({ message: 'Curso no encontrado' });
                }
                // Obtener lista de estudiantes
                const [estudiantes] = yield connection_1.connection.execute(`SELECT u.idUsuarios, u.nombres, u.apellidos, u.correo,
                ce.fechaInscripcion, ce.estado
         FROM curso_estudiante ce
         INNER JOIN usuarios u ON ce.idEstudiante = u.idUsuarios
         WHERE ce.idCurso = ?`, [idCurso]);
                res.json(Object.assign(Object.assign({}, curso[0]), { estudiantes }));
            }
            catch (error) {
                console.error('Error en getCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener estudiantes de un curso
    getEstudiantesCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso } = req.params;
                const [rows] = yield connection_1.connection.execute(`SELECT u.idUsuarios, u.nombres, u.apellidos, u.correo,
                ce.fechaInscripcion, ce.estado,
                COALESCE(AVG(cal.valor), 0) as promedio
         FROM curso_estudiante ce
         INNER JOIN usuarios u ON ce.idEstudiante = u.idUsuarios
         LEFT JOIN calificaciones cal ON ce.idEstudiante = cal.idEstudiante
            AND ce.idCurso = cal.idCurso
         WHERE ce.idCurso = ?
         GROUP BY u.idUsuarios`, [idCurso]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getEstudiantesCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Actualizar estado de un estudiante en el curso
    updateEstadoCursoEstudiante(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idCurso, idEstudiante } = req.params;
                const { estado } = req.body;
                if (!['activo', 'inactivo', 'pendiente'].includes(estado)) {
                    return res.status(400).json({
                        message: 'Estado inválido',
                        validStates: ['activo', 'inactivo', 'pendiente']
                    });
                }
                const [result] = yield conn.execute(`UPDATE curso_estudiante
         SET estado = ?
         WHERE idCurso = ? AND idEstudiante = ?`, [estado, idCurso, idEstudiante]);
                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: 'Estudiante no encontrado en el curso'
                    });
                }
                res.json({ message: 'Estado actualizado correctamente' });
            }
            catch (error) {
                console.error('Error en updateEstadoCursoEstudiante:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
            finally {
                conn.release();
            }
        });
    }
    // Actualizar curso
    updateCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idCurso } = req.params;
                const { periodo, anio, grado, seccion } = req.body;
                yield conn.beginTransaction();
                // Verificar que el curso existe
                const [curso] = yield conn.execute('SELECT idCurso FROM cursos WHERE idCurso = ?', [idCurso]);
                if (!curso[0]) {
                    yield conn.rollback();
                    return res.status(404).json({ message: 'Curso no encontrado' });
                }
                // Actualizar el curso
                const [result] = yield conn.execute(`UPDATE cursos
         SET periodo = COALESCE(?, periodo),
             anio = COALESCE(?, anio),
             grado = COALESCE(?, grado),
             seccion = COALESCE(?, seccion)
         WHERE idCurso = ?`, [periodo, anio, grado, seccion, idCurso]);
                yield conn.commit();
                res.json({
                    message: 'Curso actualizado correctamente',
                    updated: result.affectedRows > 0
                });
            }
            catch (error) {
                yield conn.rollback();
                console.error('Error en updateCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
            finally {
                conn.release();
            }
        });
    }
    // Eliminar curso
    deleteCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idCurso } = req.params;
                yield conn.beginTransaction();
                // Verificar si hay estudiantes activos
                const [estudiantes] = yield conn.execute('SELECT COUNT(*) as total FROM curso_estudiante WHERE idCurso = ? AND estado = "activo"', [idCurso]);
                if (estudiantes[0].total > 0) {
                    yield conn.rollback();
                    return res.status(400).json({
                        message: 'No se puede eliminar el curso',
                        reason: 'El curso tiene estudiantes activos'
                    });
                }
                // Eliminar registros relacionados
                yield conn.execute('DELETE FROM calificaciones WHERE idCurso = ?', [idCurso]);
                yield conn.execute('DELETE FROM curso_estudiante WHERE idCurso = ?', [idCurso]);
                yield conn.execute('DELETE FROM clases WHERE idCurso = ?', [idCurso]);
                // Eliminar el curso
                const [result] = yield conn.execute('DELETE FROM cursos WHERE idCurso = ?', [idCurso]);
                if (result.affectedRows === 0) {
                    yield conn.rollback();
                    return res.status(404).json({ message: 'Curso no encontrado' });
                }
                yield conn.commit();
                res.json({ message: 'Curso eliminado correctamente' });
            }
            catch (error) {
                yield conn.rollback();
                console.error('Error en deleteCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
            finally {
                conn.release();
            }
        });
    }
    // Agregar estudiante a curso
    addEstudianteCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idCurso } = req.params;
                const { idEstudiante } = req.body;
                yield conn.beginTransaction();
                // Verificar que el curso existe
                const [cursoExist] = yield conn.execute('SELECT idCurso FROM cursos WHERE idCurso = ?', [idCurso]);
                if (!cursoExist[0]) {
                    yield conn.rollback();
                    return res.status(404).json({ message: 'Curso no encontrado' });
                }
                // Verificar que el estudiante existe y tiene rol estudiante
                const [estudiante] = yield conn.execute(`SELECT u.idUsuarios FROM usuarios u
         INNER JOIN roles r ON u.idRol = r.idRol
         WHERE u.idUsuarios = ? AND r.nombreRol = 'estudiante'`, [idEstudiante]);
                if (!estudiante[0]) {
                    yield conn.rollback();
                    return res.status(404).json({ message: 'Estudiante no encontrado' });
                }
                // Agregar estudiante al curso
                yield conn.execute(`INSERT INTO curso_estudiante (idCurso, idEstudiante, fechaInscripcion, estado)
         VALUES (?, ?, NOW(), 'activo')`, [idCurso, idEstudiante]);
                yield conn.commit();
                res.status(201).json({ message: 'Estudiante agregado al curso correctamente' });
            }
            catch (error) {
                yield conn.rollback();
                if (error && error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        message: 'El estudiante ya está inscrito en este curso'
                    });
                }
                console.error('Error en addEstudianteCurso:', error);
                // Exponer mensaje de error para diagnóstico (se puede reducir en producción)
                return res.status(500).json({ message: 'Error interno del servidor', details: error instanceof Error ? error.message : String(error) });
            }
            finally {
                conn.release();
            }
        });
    }
    // Eliminar estudiante de curso
    removeEstudianteCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idCurso, idEstudiante } = req.params;
                yield conn.beginTransaction();
                // Eliminar calificaciones
                yield conn.execute('DELETE FROM calificaciones WHERE idCurso = ? AND idEstudiante = ?', [idCurso, idEstudiante]);
                // Eliminar asistencias
                yield conn.execute(`DELETE a FROM asistencia a
         INNER JOIN clases c ON a.idClase = c.idClase
         WHERE c.idCurso = ? AND a.idEstudiante = ?`, [idCurso, idEstudiante]);
                // Eliminar inscripción
                const [result] = yield conn.execute('DELETE FROM curso_estudiante WHERE idCurso = ? AND idEstudiante = ?', [idCurso, idEstudiante]);
                if (result.affectedRows === 0) {
                    yield conn.rollback();
                    return res.status(404).json({
                        message: 'Estudiante no encontrado en el curso'
                    });
                }
                yield conn.commit();
                res.json({ message: 'Estudiante eliminado del curso correctamente' });
            }
            catch (error) {
                yield conn.rollback();
                console.error('Error en removeEstudianteCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
            finally {
                conn.release();
            }
        });
    }
}
exports.CursosController = CursosController;
