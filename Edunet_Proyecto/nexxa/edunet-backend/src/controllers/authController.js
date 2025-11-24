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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.register = register;
const connection_1 = require("../db/connection");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const password_2 = require("../utils/password");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const usuarios = req.body.correo;
        const password = req.body.password;
        // Validar campos requeridos
        if (!usuarios || !password) {
            return res.status(400).json({
                error: 'Datos incompletos',
                details: 'El correo y la contraseña son requeridos'
            });
        }
        // Validar formato de correo
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(usuarios)) {
            return res.status(400).json({
                error: 'Formato inválido',
                details: 'El formato del correo electrónico no es válido'
            });
        }
        const conn = yield (0, connection_1.connectDB)();
        try {
            console.log('[authController] login attempt for:', usuarios);
            // Consulta preparada con campos específicos por seguridad
            const [rows] = yield conn.execute('SELECT idUsuarios, correo, password, idRol FROM usuarios WHERE correo = ?', [usuarios]);
            if (!Array.isArray(rows) || rows.length === 0) {
                console.log('[authController] user not found:', usuarios);
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                    details: 'Usuario no encontrado'
                });
            }
            const user = rows[0];
            console.log('[authController] user found, id:', user.idUsuarios);
            const valid = yield (0, password_1.comparePasswords)(password, user.password);
            console.log('[authController] password validation:', valid ? 'success' : 'failed');
            if (!valid) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                    details: 'Contraseña incorrecta'
                });
            }
            const token = (0, jwt_1.generateToken)({
                id: user.idUsuarios,
                correo: user.correo,
                rol: user.idRol
            });
            console.log('[authController] login successful for user:', user.idUsuarios);
            const response = {
                token,
                rol: user.idRol
            };
            res.json(response);
        }
        catch (err) {
            console.error('[authController] login error:', err);
            res.status(500).json({
                error: 'Error en login',
                details: err instanceof Error ? err.message : 'Error desconocido'
            });
        }
        finally {
            try {
                yield conn.release();
                console.log('[authController] connection released');
            }
            catch (e) {
                console.error('[authController] error releasing connection:', e);
            }
        }
    });
}
function forgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo } = req.body;
        try {
            const conn = yield (0, connection_1.connectDB)();
            try {
                const [rows] = yield conn.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
                if (Array.isArray(rows) && rows.length > 0) {
                    const user = rows[0];
                    // Generar token de recuperación válido por 1 hora
                    const token = (0, jwt_1.generateToken)({
                        correo: user.correo,
                        id: user.idUsuarios,
                        rol: user.idRol
                    });
                    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
                    yield (0, email_1.sendResetEmail)(correo, resetUrl);
                    res.json({ message: 'Correo de recuperación enviado' });
                }
                else {
                    res.status(404).json({ error: 'Usuario no encontrado' });
                }
            }
            finally {
                try {
                    conn.release();
                }
                catch (e) { /* ignore release errors */ }
            }
        }
        catch (err) {
            res.status(500).json({ error: 'Error al enviar correo de recuperación', details: err });
        }
    });
}
// POST /reset-password
function resetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { token, password } = req.body;
        try {
            // Verificar token
            const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'default_secret';
            const payload = jsonwebtoken_1.default.verify(token, secret);
            const correo = payload.correo;
            // Hashear nueva contraseña
            const hashedPassword = yield (0, password_2.hashPassword)(password);
            const conn = yield (0, connection_1.connectDB)();
            try {
                yield conn.execute('UPDATE usuarios SET password = ? WHERE correo = ?', [hashedPassword, correo]);
                res.json({ message: 'Contraseña actualizada correctamente' });
            }
            finally {
                try {
                    conn.release();
                }
                catch (e) { /* ignore release errors */ }
            }
        }
        catch (err) {
            res.status(400).json({ error: 'Token inválido o expirado', details: err });
        }
    });
}
// Registrar nuevo usuario
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield (0, connection_1.connectDB)();
        try {
            const userData = req.body;
            // Validar datos requeridos
            const requiredFields = ['nombres', 'apellidos', 'correo', 'password', 'documento', 'telefono', 'direccion', 'rol'];
            const missingFields = requiredFields.filter(field => !userData[field]);
            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Datos incompletos',
                    missingFields
                });
            }
            // Validar formato de correo
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(userData.correo)) {
                return res.status(400).json({
                    error: 'Formato inválido',
                    details: 'El formato del correo electrónico no es válido'
                });
            }
            // Verificar si el correo ya existe
            const [existingUser] = yield conn.execute('SELECT correo FROM usuarios WHERE correo = ?', [userData.correo]);
            if (existingUser[0]) {
                return res.status(409).json({
                    error: 'Correo ya registrado',
                    details: 'Ya existe un usuario con este correo electrónico'
                });
            }
            // Obtener el ID del rol
            const [roles] = yield conn.execute('SELECT idRol FROM roles WHERE nombreRol = ?', [userData.rol]);
            if (!roles[0]) {
                return res.status(400).json({
                    error: 'Rol inválido',
                    details: 'El rol especificado no existe'
                });
            }
            // Hashear contraseña
            const hashedPassword = yield (0, password_2.hashPassword)(userData.password);
            // Insertar usuario
            const [result] = yield conn.execute(`INSERT INTO usuarios (
        nombres, apellidos, correo, documento, telefono,
        direccion, password, idRol
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                userData.nombres,
                userData.apellidos,
                userData.correo,
                userData.documento,
                userData.telefono,
                userData.direccion,
                hashedPassword,
                roles[0].idRol
            ]);
            // Generar token
            const token = (0, jwt_1.generateToken)({
                id: result.insertId,
                correo: userData.correo,
                rol: roles[0].idRol
            });
            res.status(201).json({
                message: 'Usuario registrado correctamente',
                token,
                usuario: {
                    id: result.insertId,
                    nombres: userData.nombres,
                    apellidos: userData.apellidos,
                    correo: userData.correo,
                    rol: userData.rol
                }
            });
        }
        catch (error) {
            console.error('Error en register:', error);
            res.status(500).json({
                error: 'Error interno del servidor',
                details: error.message
            });
        }
        finally {
            conn.release();
        }
    });
}
