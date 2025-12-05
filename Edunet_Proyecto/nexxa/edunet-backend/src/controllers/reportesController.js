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
exports.ReportesController = void 0;
const connection_1 = require("../db/connection");
class ReportesController {
    // Generar reporte de rendimiento
    generarReporteRendimiento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { idCurso } = req.params;
                const { periodo } = req.body;
                const [datos] = yield connection_1.connection.execute(`SELECT
           u.idUsuarios,
           u.nombre,
           u.apellido,
           COUNT(DISTINCT cal.idCalificacion) as total_evaluaciones,
           ROUND(AVG(cal.valor), 2) as promedio,
           MIN(cal.valor) as nota_minima,
           MAX(cal.valor) as nota_maxima,
           COUNT(DISTINCT CASE WHEN cal.valor < 60 THEN cal.idCalificacion END) as reprobadas
         FROM usuarios u
         INNER JOIN curso_estudiante ce ON u.idUsuarios = ce.idEstudiante
         LEFT JOIN calificaciones cal ON ce.idEstudiante = cal.idEstudiante
           AND ce.idCurso = cal.idCurso
         WHERE ce.idCurso = ? AND ce.estado = 'activo'
         GROUP BY u.idUsuarios
         ORDER BY promedio DESC`, [idCurso]);
                const reporte = {
                    tipo: 'rendimiento',
                    fecha_generacion: new Date(),
                    periodo,
                    contenido: datos
                };
                // req.user viene del middleware de autenticación y contiene { id, correo, rol }
                const idProfesor = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const [result] = yield connection_1.connection.execute(`INSERT INTO reportes (idProfesor, idCurso, tipo, fecha_generacion, periodo, contenido)
         VALUES (?, ?, ?, ?, ?, ?)`, [idProfesor, idCurso, 'rendimiento', reporte.fecha_generacion, periodo, JSON.stringify(reporte.contenido)]);
                res.json({
                    message: 'Reporte generado correctamente',
                    idReporte: result.insertId,
                    reporte
                });
            }
            catch (error) {
                console.error('Error en generarReporteRendimiento:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener reporte específico
    getReporte(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idReporte } = req.params;
                const [rows] = yield connection_1.connection.execute(`SELECT *
         FROM reportes
         WHERE idReporte = ?`, [idReporte]);
                if (!rows[0]) {
                    return res.status(404).json({ message: 'Reporte no encontrado' });
                }
                res.json(rows[0]);
            }
            catch (error) {
                console.error('Error en getReporte:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Listar reportes de un curso
    getReportesCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso } = req.params;
                const [rows] = yield connection_1.connection.execute(`SELECT *
         FROM reportes
         WHERE idCurso = ?
         ORDER BY fecha_generacion DESC`, [idCurso]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getReportesCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Eliminar reporte
    deleteReporte(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idReporte } = req.params;
                yield connection_1.connection.execute('DELETE FROM reportes WHERE idReporte = ?', [idReporte]);
                res.json({ message: 'Reporte eliminado correctamente' });
            }
            catch (error) {
                console.error('Error en deleteReporte:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
}
exports.ReportesController = ReportesController;
