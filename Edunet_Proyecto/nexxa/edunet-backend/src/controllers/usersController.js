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
exports.getUsers = getUsers;
exports.createUser = createUser;
exports.getUserByEmail = getUserByEmail;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const connection_1 = require("../db/connection");
const password_1 = require("../utils/password");
function getUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const conn = yield (0, connection_1.connectDB)();
            try {
                const [rows] = yield conn.execute('SELECT * FROM usuarios');
                res.json(rows);
            }
            finally {
                try {
                    conn.release();
                }
                catch (e) { /* ignore */ }
            }
        }
        catch (err) {
            res.status(500).json({ error: 'Error al obtener usuarios', details: err });
        }
    });
}
function createUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nombres, apellidos, correo, documento, telefono, direccion, fotoPerfil, password, grado, contacto_emergencia, telefono_contacto_emergencia, curso_asignado, estudiante_relacionado, parentesco, cargo, rol } = req.body;
        try {
            const hashedPassword = yield (0, password_1.hashPassword)(password);
            const conn = yield (0, connection_1.connectDB)();
            try {
                const sql = `INSERT INTO usuarios (nombres, apellidos, correo, documento, telefono, direccion, fotoPerfil, password, grado, contacto_emergencia, telefono_contacto_emergencia, curso_asignado, nombre_estudiante_acargo, parentezco, cargo_admin, idRol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const [result] = yield conn.execute(sql, [
                    nombres,
                    apellidos,
                    correo,
                    documento,
                    telefono,
                    direccion,
                    fotoPerfil || null,
                    hashedPassword,
                    grado,
                    contacto_emergencia,
                    telefono_contacto_emergencia,
                    curso_asignado,
                    estudiante_relacionado,
                    parentesco,
                    cargo,
                    rol
                ]);
                const idUsuarioCreado = result.insertId;
                // Si es un acudiente (rol 3) y se proporcionó el documento del estudiante, crear relación
                if (Number(rol) === 3 && estudiante_relacionado) {
                    // Buscar al estudiante por su documento (asumiendo que estudiante_relacionado contiene el documento o nombre)
                    // Si es nombre, es ambiguo. Intentaremos asumir que el frontend enviará el documento en un campo adicional 'documento_estudiante'
                    // o que 'estudiante_relacionado' es el documento.
                    // Dado el esquema actual, usaremos 'documento_estudiante' del body si existe.
                    const documentoEstudiante = req.body.documento_estudiante;
                    if (documentoEstudiante) {
                        const [estudiantes] = yield conn.execute('SELECT idUsuarios FROM usuarios WHERE documento = ? AND idRol = 1', [documentoEstudiante]);
                        if (estudiantes.length > 0) {
                            const idEstudiante = estudiantes[0].idUsuarios;
                            yield conn.execute('INSERT INTO padre_estudiante (idPadre, idEstudiante) VALUES (?, ?)', [idUsuarioCreado, idEstudiante]);
                        }
                        else {
                            console.warn(`No se encontró estudiante con documento ${documentoEstudiante} para asociar al padre.`);
                        }
                    }
                }
                res.status(201).json({ message: 'Usuario registrado correctamente', idUsuario: idUsuarioCreado });
            }
            finally {
                try {
                    conn.release();
                }
                catch (e) { /* ignore */ }
            }
        }
        catch (err) {
            res.status(500).json({ error: 'Error al registrar usuario', details: err });
        }
    });
}
function getUserByEmail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo } = req.params;
        try {
            const conn = yield (0, connection_1.connectDB)();
            try {
                const [rows] = yield conn.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
                if (Array.isArray(rows) && rows.length > 0) {
                    res.json(rows[0]);
                }
                else {
                    res.status(404).json({ error: 'Usuario no encontrado' });
                }
            }
            finally {
                try {
                    conn.release();
                }
                catch (e) { /* ignore */ }
            }
        }
        catch (err) {
            res.status(500).json({ error: 'Error al buscar usuario', details: err });
        }
    });
}
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo } = req.params;
        let fields = Object.assign({}, req.body);
        const allowedFields = [
            'nombres', 'apellidos', 'documento', 'telefono', 'direccion', 'fotoPerfil', 'password', 'grado',
            'contacto_emergencia', 'telefono_contacto_emergencia', 'curso_asignado',
            'nombre_estudiante_acargo', 'parentezco', 'cargo_admin', 'idRol'
        ];
        // Hash password if contrasena is present
        if (fields.password) {
            fields.password = yield (0, password_1.hashPassword)(fields.password);
            delete fields.password;
        }
        // Map frontend fields to DB fields
        if (fields.estudiante_relacionado) {
            fields.nombre_estudiante_acargo = fields.estudiante_relacionado;
            delete fields.estudiante_relacionado;
        }
        if (fields.parentesco) {
            fields.parentezco = fields.parentesco;
            delete fields.parentesco;
        }
        if (fields.cargo) {
            fields.cargo_admin = fields.cargo;
            delete fields.cargo;
        }
        if (fields.rol) {
            fields.idRol = fields.rol;
            delete fields.rol;
        }
        fields = Object.fromEntries(Object.entries(fields).filter(([key]) => allowedFields.includes(key)));
        try {
            const conn = yield (0, connection_1.connectDB)();
            try {
                if (Object.keys(fields).length === 0) {
                    return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
                }
                const setStr = Object.keys(fields).map(key => `${key} = ?`).join(', ');
                const values = Object.values(fields);
                const sql = `UPDATE usuarios SET ${setStr} WHERE correo = ?`;
                yield conn.execute(sql, [...values, correo]);
                res.json({ message: 'Usuario actualizado' });
            }
            finally {
                try {
                    conn.release();
                }
                catch (e) { /* ignore */ }
            }
        }
        catch (err) {
            res.status(500).json({ error: 'Error al actualizar usuario', details: err });
        }
    });
}
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo } = req.params;
        try {
            const conn = yield (0, connection_1.connectDB)();
            try {
                yield conn.execute('DELETE FROM usuarios WHERE correo = ?', [correo]);
                res.json({ message: 'Usuario eliminado' });
            }
            finally {
                try {
                    conn.release();
                }
                catch (e) { /* ignore */ }
            }
        }
        catch (err) {
            res.status(500).json({ error: 'Error al eliminar usuario', details: err });
        }
    });
}
