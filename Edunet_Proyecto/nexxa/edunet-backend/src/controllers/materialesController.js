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
exports.MaterialesController = void 0;
const connection_1 = require("../db/connection");
class MaterialesController {
    // Publicar material (Profesor/Admin)
    createMaterial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso, titulo, descripcion, url_archivo, tipo } = req.body;
                const [result] = yield connection_1.connection.execute(`INSERT INTO materiales (idCurso, titulo, descripcion, url_archivo, tipo)
         VALUES (?, ?, ?, ?, ?)`, [idCurso, titulo, descripcion, url_archivo, tipo]);
                res.status(201).json({
                    message: 'Material publicado correctamente',
                    idMaterial: result.insertId
                });
            }
            catch (error) {
                console.error('Error en createMaterial:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener materiales de un curso (Estudiante/Profesor/Admin)
    getMaterialesCurso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idCurso } = req.params;
                const [rows] = yield connection_1.connection.execute(`SELECT * FROM materiales WHERE idCurso = ? ORDER BY fecha_publicacion DESC`, [idCurso]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getMaterialesCurso:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Eliminar material
    deleteMaterial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idMaterial } = req.params;
                yield connection_1.connection.execute('DELETE FROM materiales WHERE idMaterial = ?', [idMaterial]);
                res.json({ message: 'Material eliminado correctamente' });
            }
            catch (error) {
                console.error('Error en deleteMaterial:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
}
exports.MaterialesController = MaterialesController;
