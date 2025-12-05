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
exports.ProfesorController = void 0;
const connection_1 = require("../db/connection");
class ProfesorController {
    // Obtener dashboard del profesor
    getDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { idProfesor } = req.params;
                const dashboard = {
                    proximasClases: [],
                    cursosActivos: 0,
                    estudiantesTotales: 0,
                    proximasEntregas: []
                };
                // Obtener próximas clases
                const [clases] = yield connection_1.connection.execute(`SELECT c.*, m.nombre as materia, h.hora_inicio, h.hora_fin, h.salon
         FROM clases c
         INNER JOIN cursos cu ON c.idCurso = cu.idCurso
         INNER JOIN materias m ON cu.idMateria = m.idMateria
         INNER JOIN horarios h ON cu.idCurso = h.idCurso
         WHERE cu.idProfesor = ? AND c.fecha >= CURDATE()
         ORDER BY c.fecha, h.hora_inicio
         LIMIT 5`, [idProfesor]);
                dashboard.proximasClases = clases;
                // Obtener conteo de cursos activos
                const [cursos] = yield connection_1.connection.execute(`SELECT COUNT(DISTINCT idCurso) as total
         FROM cursos
         WHERE idProfesor = ?`, [idProfesor]);
                dashboard.cursosActivos = ((_a = cursos[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
                // Obtener conteo total de estudiantes
                const [estudiantes] = yield connection_1.connection.execute(`SELECT COUNT(DISTINCT ce.idEstudiante) as total
         FROM curso_estudiante ce
         INNER JOIN cursos c ON ce.idCurso = c.idCurso
         WHERE c.idProfesor = ? AND ce.estado = 'activo'`, [idProfesor]);
                dashboard.estudiantesTotales = ((_b = estudiantes[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
                res.json(dashboard);
            }
            catch (error) {
                console.error('Error en getDashboard:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Obtener perfil del profesor
    getPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idProfesor } = req.params;
                const [rows] = yield connection_1.connection.execute(`
        SELECT
          u.idUsuarios,
          u.nombres,
          u.apellidos,
          u.correo,
          u.fotoPerfil,
          up.especialidad,
          up.titulo
        FROM usuarios u
        LEFT JOIN usuario_profesor up ON u.idUsuarios = up.idUsuario
        WHERE u.idUsuarios = ? AND u.idRol = (
          SELECT idRol FROM roles WHERE nombreRol = 'profesor'
        )`, [idProfesor]);
                if (!rows[0]) {
                    return res.status(404).json({ message: 'Profesor no encontrado' });
                }
                res.json(rows[0]);
            }
            catch (error) {
                console.error('Error en getPerfil:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
    // Actualizar perfil del profesor
    updatePerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield connection_1.connection.getConnection();
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
                yield conn.beginTransaction();
                console.log('updatePerfil: Transaction started');
                // Verificar que el profesor existe y es un profesor
                const [rows] = yield conn.execute(`
        SELECT
          u.idUsuarios,
          u.nombres,
          u.apellidos,
          u.correo,
          u.fotoPerfil,
          up.especialidad,
          up.titulo
        FROM usuarios u
        INNER JOIN roles r ON u.idRol = r.idRol
        LEFT JOIN usuario_profesor up ON u.idUsuarios = up.idUsuario
        WHERE u.idUsuarios = ? AND r.nombreRol = 'profesor'
      `, [idProfesor]);
                if (!rows[0]) {
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
        WHERE idUsuarios = ? AND idRol = (
          SELECT idRol FROM roles WHERE nombreRol = 'profesor'
        )
      `, [nombres, apellidos, idProfesor]);
                if (userResult.affectedRows === 0) {
                    yield conn.rollback();
                    return res.status(400).json({
                        message: 'Error al actualizar usuario',
                        details: 'No se pudo actualizar el registro del usuario'
                    });
                }
                // Actualizar o insertar datos del profesor
                const [profResult] = yield conn.execute(`
        INSERT INTO usuario_profesor (idUsuario, especialidad, titulo)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        especialidad = VALUES(especialidad),
        titulo = VALUES(titulo)
      `, [idProfesor, especialidad, titulo]);
                yield conn.commit();
                const [updatedData] = yield conn.execute(`
        SELECT
          u.idUsuarios,
          u.nombres,
          u.apellidos,
          u.correo,
          up.especialidad,
          up.titulo
        FROM usuarios u
        LEFT JOIN usuario_profesor up ON u.idUsuarios = up.idUsuario
        WHERE u.idUsuarios = ?
      `, [idProfesor]);
                res.json({
                    message: 'Perfil actualizado correctamente',
                    data: updatedData[0]
                });
            }
            catch (error) {
                console.error('Error en updatePerfil:', {
                    message: error.message,
                    code: error.code,
                    errno: error.errno,
                    sqlMessage: error.sqlMessage,
                    sql: error.sql,
                    stack: error.stack
                });
                try {
                    yield conn.rollback();
                }
                catch (rollbackError) {
                    console.error('Error al hacer rollback:', rollbackError);
                }
                if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(400).json({
                        message: 'Error de referencia',
                        details: 'El ID del profesor no es válido'
                    });
                }
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        message: 'Conflicto',
                        details: 'Ya existe un registro con estos datos'
                    });
                }
                res.status(500).json({
                    message: 'Error interno del servidor',
                    error: error.message
                });
            }
            finally {
                try {
                    yield conn.release();
                }
                catch (releaseError) {
                    console.error('Error al liberar la conexión:', releaseError);
                }
            }
        });
    }
    // Obtener horario del profesor
    getHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { idProfesor } = req.params;
                const [rows] = yield connection_1.connection.execute(`SELECT h.*, c.idCurso, m.nombre as materia, m.codigo
         FROM horarios h
         INNER JOIN cursos c ON h.idCurso = c.idCurso
         INNER JOIN materias m ON c.idMateria = m.idMateria
         WHERE c.idProfesor = ?
         ORDER BY h.dia_semana, h.hora_inicio`, [idProfesor]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error en getHorario:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        });
    }
}
exports.ProfesorController = ProfesorController;
