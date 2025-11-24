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
exports.CalificacionesController = void 0;
const connection_1 = require("../db/connection");
class CalificacionesController {
    // Obtener calificaciones de un curso
    getCalificacionesCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso } = req.params;
                // Validar y convertir idCurso a número
                const id = Number(idCurso);
                if (isNaN(id)) {
                    return res.status(400).json({
                        message: 'ID de curso inválido',
                        detail: 'El parámetro idCurso debe ser un número'
                    });
                }
                const [rows] = yield connection_1.connection.execute(`SELECT c.idCalificacion, c.idCurso, c.idEstudiante,
                c.tipo, c.nombre, c.valor, c.peso,
                c.fecha_asignacion, c.comentarios,
                u.nombres as nombre_estudiante,
                u.apellidos as apellido_estudiante
         FROM calificaciones c
         INNER JOIN usuarios u ON c.idEstudiante = u.idUsuarios
         WHERE c.idCurso = ?
         ORDER BY u.apellidos, u.nombres, c.fecha_asignacion`, [id]);
                // Si no hay calificaciones, devolver array vacío (no es error)
                res.json(rows || []);
            }
            catch (error) {
                console.error('Error en getCalificacionesCurso:', error);
                res.status(500).json({
                    message: 'Error interno del servidor',
                    detail: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        });
    }
    // Obtener calificaciones de un estudiante en un curso
    getCalificacionesEstudiante(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso, idEstudiante } = req.params;
                const usuarioSolicitante = req.user;
                // Verificación de acceso
                if ((usuarioSolicitante === null || usuarioSolicitante === void 0 ? void 0 : usuarioSolicitante.rol) === 1) { // Estudiante
                    if (usuarioSolicitante.id !== Number(idEstudiante)) {
                        return res.status(403).json({ message: 'No tiene permiso para ver las calificaciones de otro estudiante' });
                    }
                }
                else if ((usuarioSolicitante === null || usuarioSolicitante === void 0 ? void 0 : usuarioSolicitante.rol) === 3) { // Acudiente
                    // Verificar relación padre-estudiante
                    const [relacion] = yield connection_1.connection.execute('SELECT * FROM padre_estudiante WHERE idPadre = ? AND idEstudiante = ?', [usuarioSolicitante.id, idEstudiante]);
                    if (relacion.length === 0) {
                        return res.status(403).json({ message: 'Este estudiante no está asociado a su cuenta' });
                    }
                }
                const [rows] = yield connection_1.connection.execute(`SELECT *
         FROM calificaciones
         WHERE idCurso = ? AND idEstudiante = ?
         ORDER BY fecha_asignacion`, [idCurso, idEstudiante]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getCalificacionesEstudiante:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Registrar una nueva calificación
    createCalificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso, idEstudiante, tipo, nombre, valor, peso, comentarios } = req.body;
                const fecha_asignacion = new Date();
                const [result] = yield connection_1.connection.execute(`INSERT INTO calificaciones
         (idCurso, idEstudiante, tipo, nombre, valor, peso, fecha_asignacion, comentarios)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [idCurso, idEstudiante, tipo, nombre, valor, peso, fecha_asignacion, comentarios]);
                res.status(201).json({
                    message: 'Calificación registrada correctamente',
                    idCalificacion: result.insertId
                });
            }
            catch (error) {
                console.error('Error en createCalificacion:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Actualizar una calificación
    updateCalificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCalificacion } = req.params;
                const { valor, comentarios } = req.body;
                yield connection_1.connection.execute(`UPDATE calificaciones
         SET valor = ?, comentarios = ?
         WHERE idCalificacion = ?`, [valor, comentarios, idCalificacion]);
                res.json({ message: 'Calificación actualizada correctamente' });
            }
            catch (error) {
                console.error('Error en updateCalificacion:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Eliminar una calificación
    deleteCalificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCalificacion } = req.params;
                yield connection_1.connection.execute('DELETE FROM calificaciones WHERE idCalificacion = ?', [idCalificacion]);
                res.json({ message: 'Calificación eliminada correctamente' });
            }
            catch (error) {
                console.error('Error en deleteCalificacion:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener promedio del curso
    getPromedioCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso } = req.params;
                const [rows] = yield connection_1.connection.execute(`SELECT
           u.idUsuarios,
           u.nombres,
           u.apellidos,
           ROUND(AVG(c.valor * c.peso / 100), 2) as promedio
         FROM usuarios u
         INNER JOIN curso_estudiante ce ON u.idUsuarios = ce.idEstudiante
         LEFT JOIN calificaciones c ON ce.idEstudiante = c.idEstudiante
           AND ce.idCurso = c.idCurso
         WHERE ce.idCurso = ? AND ce.estado = 'activo'
         GROUP BY u.idUsuarios, u.nombres, u.apellidos
         ORDER BY promedio DESC`, [idCurso]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getPromedioCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
}
exports.CalificacionesController = CalificacionesController;
