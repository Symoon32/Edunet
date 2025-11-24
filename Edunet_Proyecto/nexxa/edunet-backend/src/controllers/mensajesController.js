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
exports.MensajesController = void 0;
const connection_1 = require("../db/connection");
class MensajesController {
    // Enviar mensaje
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { idDestinatario, asunto, contenido } = req.body;
                const idRemitente = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // From authMiddleware
                if (!idRemitente) {
                    return res.status(401).json({ message: 'Usuario no autenticado' });
                }
                const [result] = yield connection_1.connection.execute(`INSERT INTO mensajes (idRemitente, idDestinatario, asunto, contenido)
         VALUES (?, ?, ?, ?)`, [idRemitente, idDestinatario, asunto, contenido]);
                res.status(201).json({
                    message: 'Mensaje enviado correctamente',
                    idMensaje: result.insertId
                });
            }
            catch (error) {
                console.error('Error en sendMessage:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener mensajes recibidos
    getReceivedMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const [rows] = yield connection_1.connection.execute(`SELECT m.*, u.nombres as nombre_remitente, u.apellidos as apellido_remitente
         FROM mensajes m
         JOIN usuarios u ON m.idRemitente = u.idUsuarios
         WHERE m.idDestinatario = ?
         ORDER BY m.fecha_envio DESC`, [idUsuario]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getReceivedMessages:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener mensajes enviados
    getSentMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const [rows] = yield connection_1.connection.execute(`SELECT m.*, u.nombres as nombre_destinatario, u.apellidos as apellido_destinatario
         FROM mensajes m
         JOIN usuarios u ON m.idDestinatario = u.idUsuarios
         WHERE m.idRemitente = ?
         ORDER BY m.fecha_envio DESC`, [idUsuario]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getSentMessages:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Marcar como leído
    markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { idMensaje } = req.params;
                const idUsuario = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                // Verify ownership (recipient)
                const [rows] = yield connection_1.connection.execute('SELECT * FROM mensajes WHERE idMensaje = ? AND idDestinatario = ?', [idMensaje, idUsuario]);
                if (rows.length === 0) {
                    return res.status(404).json({ message: 'Mensaje no encontrado o no autorizado' });
                }
                yield connection_1.connection.execute('UPDATE mensajes SET leido = TRUE WHERE idMensaje = ?', [idMensaje]);
                res.json({ message: 'Mensaje marcado como leído' });
            }
            catch (error) {
                console.error('Error en markAsRead:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
}
exports.MensajesController = MensajesController;
