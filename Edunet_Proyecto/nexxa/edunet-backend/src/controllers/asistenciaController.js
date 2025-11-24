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
exports.AsistenciaController = void 0;
const connection_1 = require("../db/connection");
class AsistenciaController {
    registrarAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idClase } = req.params;
                const { asistencias } = req.body;
                if (!Array.isArray(asistencias)) {
                    res.status(400).json({
                        message: "Formato inválido",
                        details: "asistencias debe ser un array"
                    });
                    return;
                }
                const estadosValidos = ["presente", "ausente", "tardanza", "justificado"];
                const [clase] = yield conn.execute("SELECT idClase, idCurso, fecha FROM clases WHERE idClase = ?", [idClase]);
                if (!clase[0]) {
                    res.status(404).json({
                        message: "Clase no encontrada"
                    });
                    return;
                }
                yield conn.beginTransaction();
                try {
                    for (const asistencia of asistencias) {
                        if (!estadosValidos.includes(asistencia.estado)) {
                            throw new Error(`Estado inválido: ${asistencia.estado}`);
                        }
                        yield conn.execute(`INSERT INTO asistencia
             (idClase, idEstudiante, estado, observaciones)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             estado = VALUES(estado),
             observaciones = VALUES(observaciones)`, [
                            idClase,
                            asistencia.idEstudiante,
                            asistencia.estado,
                            asistencia.observaciones || null
                        ]);
                    }
                    yield conn.commit();
                    res.json({
                        message: "Asistencia registrada correctamente",
                        registros: asistencias.length
                    });
                }
                catch (error) {
                    yield conn.rollback();
                    throw error;
                }
            }
            catch (error) {
                console.error("Error en registrarAsistencia:", error);
                res.status(500).json({
                    message: "Error interno del servidor",
                    details: error.message
                });
            }
            finally {
                conn.release();
            }
        });
    }
    getAsistenciaClase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idClase } = req.params;
                // Verificar que la clase exista
                const [claseRows] = yield conn.execute('SELECT idClase, idCurso, fecha FROM clases WHERE idClase = ?', [idClase]);
                if (!claseRows[0]) {
                    res.status(404).json({ message: 'Clase no encontrada' });
                    return;
                }
                const [asistencias] = yield conn.execute(`SELECT a.*, u.nombres, u.apellidos
         FROM asistencia a
         JOIN usuarios u ON a.idEstudiante = u.idUsuarios
         WHERE a.idClase = ?
         ORDER BY u.apellidos, u.nombres`, [idClase]);
                // Información adicional para depuración cuando no hay registros
                const [countRows] = yield conn.execute('SELECT COUNT(*) as totalAsistencias FROM asistencia WHERE idClase = ?', [idClase]);
                const [estudiantesCursoRows] = yield conn.execute('SELECT COUNT(*) as totalEstudiantes FROM curso_estudiante WHERE idCurso = ?', [claseRows[0].idCurso]);
                res.json({
                    data: asistencias,
                    meta: {
                        clase: claseRows[0],
                        totalAsistencias: ((_a = countRows[0]) === null || _a === void 0 ? void 0 : _a.totalAsistencias) || 0,
                        totalEstudiantes: ((_b = estudiantesCursoRows[0]) === null || _b === void 0 ? void 0 : _b.totalEstudiantes) || 0
                    }
                });
            }
            catch (error) {
                console.error("Error en getAsistenciaClase:", error);
                res.status(500).json({
                    message: "Error interno del servidor",
                    details: error.message
                });
            }
            finally {
                conn.release();
            }
        });
    }
    getReporteAsistenciaCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idCurso } = req.params;
                const [reporte] = yield conn.execute(`SELECT
          u.idUsuarios as idEstudiante,
          u.nombres,
          u.apellidos,
          COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as presentes,
          COUNT(CASE WHEN a.estado = "ausente" THEN 1 END) as ausentes,
          COUNT(CASE WHEN a.estado = "tardanza" THEN 1 END) as tardanzas,
          COUNT(CASE WHEN a.estado = "justificado" THEN 1 END) as justificados,
          COUNT(a.idAsistencia) as total_clases
         FROM usuarios u
         JOIN curso_estudiante ec ON u.idUsuarios = ec.idEstudiante
         LEFT JOIN clases c ON c.idCurso = ec.idCurso
         LEFT JOIN asistencia a ON a.idClase = c.idClase AND a.idEstudiante = u.idUsuarios
         WHERE ec.idCurso = ?
         GROUP BY u.idUsuarios, u.nombres, u.apellidos
         ORDER BY u.apellidos, u.nombres`, [idCurso]);
                res.json(reporte);
            }
            catch (error) {
                console.error("Error en getReporteAsistenciaCurso:", error);
                res.status(500).json({
                    message: "Error interno del servidor",
                    details: error.message
                });
            }
            finally {
                conn.release();
            }
        });
    }
    updateAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idAsistencia } = req.params;
                const { estado, observaciones } = req.body;
                const estadosValidos = ["presente", "ausente", "tardanza", "justificado"];
                if (!estadosValidos.includes(estado)) {
                    res.status(400).json({
                        message: "Estado inválido",
                        details: `El estado debe ser uno de: ${estadosValidos.join(", ")}`
                    });
                    return;
                }
                yield conn.execute(`UPDATE asistencia
         SET estado = ?, observaciones = ?
         WHERE idAsistencia = ?`, [estado, observaciones || null, idAsistencia]);
                res.json({
                    message: "Asistencia actualizada correctamente"
                });
            }
            catch (error) {
                console.error("Error en updateAsistencia:", error);
                res.status(500).json({
                    message: "Error interno del servidor",
                    details: error.message
                });
            }
            finally {
                conn.release();
            }
        });
    }
    getAsistenciaEstudianteCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
            try {
                const { idEstudiante, idCurso } = req.params;
                const usuarioSolicitante = req.user;
                // Verificación de acceso
                if ((usuarioSolicitante === null || usuarioSolicitante === void 0 ? void 0 : usuarioSolicitante.rol) === 1) { // Estudiante
                    if (usuarioSolicitante.id !== Number(idEstudiante)) {
                        res.status(403).json({ message: 'No tiene permiso para ver la asistencia de otro estudiante' });
                        return;
                    }
                }
                else if ((usuarioSolicitante === null || usuarioSolicitante === void 0 ? void 0 : usuarioSolicitante.rol) === 3) { // Acudiente
                    // Verificar relación padre-estudiante
                    const [relacion] = yield conn.execute('SELECT * FROM padre_estudiante WHERE idPadre = ? AND idEstudiante = ?', [usuarioSolicitante.id, idEstudiante]);
                    if (relacion.length === 0) {
                        res.status(403).json({ message: 'Este estudiante no está asociado a su cuenta' });
                        return;
                    }
                }
                const [asistencias] = yield conn.execute(`SELECT
          a.*,
          c.fecha,
          c.tema,
          c.hora_inicio,
          c.hora_fin
         FROM asistencia a
         JOIN clases c ON a.idClase = c.idClase
         WHERE c.idCurso = ?
         AND a.idEstudiante = ?
         ORDER BY c.fecha DESC, c.hora_inicio DESC`, [idCurso, idEstudiante]);
                res.json(asistencias);
            }
            catch (error) {
                console.error("Error en getAsistenciaEstudianteCurso:", error);
                res.status(500).json({
                    message: "Error interno del servidor",
                    details: error.message
                });
            }
            finally {
                conn.release();
            }
        });
    }
}
exports.AsistenciaController = AsistenciaController;
