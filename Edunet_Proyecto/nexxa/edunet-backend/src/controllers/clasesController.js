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
exports.ClasesController = void 0;
const connection_1 = require("../db/connection");
class ClasesController {
    // Crear nueva clase
    createClase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso, fecha, hora_inicio, hora_fin, tema, descripcion } = req.body;
                const [result] = yield connection_1.connection.execute(`INSERT INTO clases (idCurso, fecha, hora_inicio, hora_fin, tema, descripcion, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'programada')`, [idCurso, fecha, hora_inicio, hora_fin, tema, descripcion]);
                res.status(201).json({
                    message: 'Clase creada correctamente',
                    idClase: result.insertId
                });
            }
            catch (error) {
                console.error('Error en createClase:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener clases de un curso
    getClasesCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso } = req.params;
                const { fecha_inicio, fecha_fin } = req.query;
                // Validate idCurso
                const id = Number(idCurso);
                if (isNaN(id)) {
                    return res.status(400).json({ message: 'idCurso inválido' });
                }
                // Ensure we never pass `undefined` as a bind parameter. Use null when no
                // fecha_inicio is provided so the `? IS NULL` check in SQL works.
                const start = (fecha_inicio !== null && fecha_inicio !== void 0 ? fecha_inicio : null);
                const end = (fecha_fin !== null && fecha_fin !== void 0 ? fecha_fin : null);
                // Select explicit columns and include them in GROUP BY to avoid
                // ONLY_FULL_GROUP_BY SQL errors when using aggregates alongside non-aggregated columns.
                const [rows] = yield connection_1.connection.execute(`SELECT c.idClase, c.idCurso, c.fecha, c.hora_inicio, c.hora_fin, c.tema, c.descripcion, c.estado,
                COUNT(DISTINCT a.idEstudiante) AS total_asistentes,
                COUNT(DISTINCT ce.idEstudiante) AS total_estudiantes
         FROM clases c
         LEFT JOIN asistencia a ON c.idClase = a.idClase AND a.estado = 'presente'
         LEFT JOIN curso_estudiante ce ON c.idCurso = ce.idCurso AND ce.estado = 'activo'
         WHERE c.idCurso = ?
           AND (c.fecha BETWEEN ? AND ? OR ? IS NULL)
         GROUP BY c.idClase, c.idCurso, c.fecha, c.hora_inicio, c.hora_fin, c.tema, c.descripcion, c.estado
         ORDER BY c.fecha DESC, c.hora_inicio`,
                // If start/end are null, replace with wide defaults for the BETWEEN
                [id, start !== null && start !== void 0 ? start : '1900-01-01', end !== null && end !== void 0 ? end : '2100-12-31', start]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getClasesCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener detalle de una clase
    getClase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idClase } = req.params;
                const [clase] = yield connection_1.connection.execute(`SELECT c.*, cu.idProfesor, m.nombre as materia
         FROM clases c
         INNER JOIN cursos cu ON c.idCurso = cu.idCurso
         INNER JOIN materias m ON cu.idMateria = m.idMateria
         WHERE c.idClase = ?`, [idClase]);
                if (!clase[0]) {
                    return res.status(404).json({ message: 'Clase no encontrada' });
                }
                // Obtener asistencia
                const [asistencia] = yield connection_1.connection.execute(`SELECT a.*, u.nombres, u.apellidos
         FROM asistencia a
         INNER JOIN usuarios u ON a.idEstudiante = u.idUsuarios
         WHERE a.idClase = ?`, [idClase]);
                res.json(Object.assign(Object.assign({}, clase[0]), { asistencia }));
            }
            catch (error) {
                console.error('Error en getClase:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Actualizar clase
    updateClase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idClase } = req.params;
                const { fecha, hora_inicio, hora_fin, tema, descripcion, estado } = req.body;
                yield connection_1.connection.execute(`UPDATE clases
         SET fecha = ?, hora_inicio = ?, hora_fin = ?,
             tema = ?, descripcion = ?, estado = ?
         WHERE idClase = ?`, [fecha, hora_inicio, hora_fin, tema, descripcion, estado, idClase]);
                res.json({ message: 'Clase actualizada correctamente' });
            }
            catch (error) {
                console.error('Error en updateClase:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Eliminar clase
    deleteClase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idClase } = req.params;
                const conn = yield connection_1.connection.getConnection();
                try {
                    yield conn.beginTransaction();
                    // Eliminar registros de asistencia
                    yield conn.execute('DELETE FROM asistencia WHERE idClase = ?', [idClase]);
                    // Eliminar la clase
                    yield conn.execute('DELETE FROM clases WHERE idClase = ?', [idClase]);
                    yield conn.commit();
                    res.json({ message: 'Clase eliminada correctamente' });
                }
                catch (txErr) {
                    yield conn.rollback();
                    throw txErr;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                console.error('Error en deleteClase:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
}
exports.ClasesController = ClasesController;
