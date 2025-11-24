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
exports.EventosController = void 0;
const connection_1 = require("../db/connection");
class EventosController {
    // Crear evento (Admin/Profesor)
    createEvento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios } = req.body;
                const [result] = yield connection_1.connection.execute(`INSERT INTO eventos (titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios]);
                res.status(201).json({
                    message: 'Evento creado correctamente',
                    idEvento: result.insertId
                });
            }
            catch (error) {
                console.error('Error en createEvento:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener eventos
    getEventos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Filtros opcionales
                const { tipo, destinatarios } = req.query;
                let query = 'SELECT * FROM eventos WHERE 1=1';
                const params = [];
                if (tipo) {
                    query += ' AND tipo = ?';
                    params.push(tipo);
                }
                // Simplificación: no filtramos estrictamente por rol del usuario, pero el frontend puede hacerlo.
                // Idealmente, filtraríamos por "destinatarios" IN ('todos', 'mi_rol')
                query += ' ORDER BY fecha_inicio DESC';
                const [rows] = yield connection_1.connection.execute(query, params);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getEventos:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Eliminar evento
    deleteEvento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idEvento } = req.params;
                yield connection_1.connection.execute('DELETE FROM eventos WHERE idEvento = ?', [idEvento]);
                res.json({ message: 'Evento eliminado correctamente' });
            }
            catch (error) {
                console.error('Error en deleteEvento:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
}
exports.EventosController = EventosController;
