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
exports.updatePerfil = updatePerfil;
const connection_1 = require("../db/connection");
function updatePerfil(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { idProfesor } = req.params;
            const { nombres, apellidos, correo, especialidad, titulo } = req.body;
            console.log('updatePerfil: Request received', {
                params: { idProfesor },
                body: { nombres, apellidos, correo, especialidad, titulo }
            });
            // Validación de datos requeridos
            if (!nombres || !apellidos || !especialidad || !titulo) {
                return res.status(400).json({
                    message: 'Datos incompletos',
                    required: ['nombres', 'apellidos', 'especialidad', 'titulo'],
                    received: { nombres, apellidos, especialidad, titulo }
                });
            }
            const conn = yield connection_1.connection.getConnection();
            try {
                yield conn.beginTransaction();
                console.log('updatePerfil: Transaction started');
                // Verificar que el profesor existe y es un profesor
                const [profesor] = yield conn.execute(`
        SELECT u.idUsuarios, u.nombres, u.apellidos, r.nombreRol
        FROM usuarios u
        INNER JOIN roles r ON u.idRol = r.idRol
        WHERE u.idUsuarios = ? AND r.nombreRol = 'profesor'
      `, [idProfesor]);
                if (!profesor[0]) {
                    yield conn.rollback();
                    return res.status(404).json({
                        message: 'Profesor no encontrado',
                        details: 'El ID proporcionado no corresponde a un profesor activo'
                    });
                }
                // Actualizar datos básicos del usuario
                const [userResult] = yield conn.execute(`
        UPDATE usuarios
        SET nombres = ?, apellidos = ?
        WHERE idUsuarios = ?
      `, [nombres, apellidos, idProfesor]);
                if (userResult.affectedRows === 0) {
                    yield conn.rollback();
                    return res.status(404).json({
                        message: 'Error al actualizar usuario',
                        details: 'No se pudo actualizar el registro del usuario'
                    });
                }
                // Verificar si existe registro en usuario_profesor
                const [existingProfesor] = yield conn.execute(`
        SELECT idUsuario FROM usuario_profesor WHERE idUsuario = ?
      `, [idProfesor]);
                if (existingProfesor[0]) {
                    // Actualizar datos del profesor
                    yield conn.execute(`
          UPDATE usuario_profesor
          SET especialidad = ?, titulo = ?
          WHERE idUsuario = ?
        `, [especialidad, titulo, idProfesor]);
                }
                else {
                    // Insertar nuevo registro de profesor
                    yield conn.execute(`
          INSERT INTO usuario_profesor (idUsuario, especialidad, titulo)
          VALUES (?, ?, ?)
        `, [idProfesor, especialidad, titulo]);
                }
                yield conn.commit();
                res.json({
                    message: 'Perfil actualizado correctamente',
                    data: {
                        idProfesor,
                        nombres,
                        apellidos,
                        especialidad,
                        titulo
                    }
                });
            }
            catch (error) {
                yield conn.rollback();
                console.error('Error en operación de base de datos:', {
                    message: error.message,
                    code: error.code,
                    errno: error.errno,
                    sqlMessage: error.sqlMessage
                });
                if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(400).json({
                        message: 'Error de referencia',
                        details: 'El ID del profesor no es válido'
                    });
                }
                throw error;
            }
            finally {
                conn.release();
            }
        }
        catch (error) {
            console.error('Error en updatePerfil:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlMessage: error.sqlMessage,
                stack: error.stack
            });
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    });
}
