"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenError = void 0;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Validación del JWT_SECRET
function getJwtSecret() {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        console.error('ERROR: JWT_SECRET no está configurado en las variables de entorno');
        throw new Error('JWT_SECRET es requerido en producción');
    }
    if (!process.env.JWT_SECRET) {
        console.warn('ADVERTENCIA: usando secret de desarrollo local');
        return 'desarrollo_local_unicamente';
    }
    return process.env.JWT_SECRET;
}
const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
class TokenError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'TokenError';
    }
}
exports.TokenError = TokenError;
/**
 * Genera un token JWT con el payload proporcionado
 * @throws {TokenError} Si hay un error al generar el token
 */
function generateToken(payload) {
    try {
        if (!payload.id || !payload.correo || payload.rol === undefined) {
            throw new TokenError('Payload incompleto', 'INVALID_PAYLOAD');
        }
        console.log('generateToken: creating token with payload:', {
            id: payload.id,
            correo: payload.correo,
            rol: payload.rol
        });
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            algorithm: 'HS256'
        });
        console.log('generateToken: token created successfully');
        return token;
    }
    catch (error) {
        console.error('Error generating token:', error);
        if (error instanceof TokenError) {
            throw error;
        }
        throw new TokenError('Error al generar el token', 'TOKEN_GENERATION_ERROR');
    }
}
/**
 * Verifica y decodifica un token JWT
 * @throws {TokenError} Si el token es inválido o está expirado
 */
function verifyToken(token) {
    try {
        if (!token) {
            throw new TokenError('Token no proporcionado', 'TOKEN_REQUIRED');
        }
        console.log('verifyToken: verifying token');
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
            algorithms: ['HS256']
        });
        if (!payload.id || !payload.correo || payload.rol === undefined) {
            throw new TokenError('Token con estructura inválida', 'INVALID_TOKEN_STRUCTURE');
        }
        console.log('verifyToken: token verified, payload:', {
            id: payload.id,
            correo: payload.correo,
            rol: payload.rol
        });
        return payload;
    }
    catch (error) {
        console.error('Error verifying token:', error);
        if (error instanceof TokenError) {
            throw error;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new TokenError('Token expirado', 'TOKEN_EXPIRED');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new TokenError('Token inválido', 'INVALID_TOKEN');
        }
        throw new TokenError('Error al verificar el token', 'TOKEN_VERIFICATION_ERROR');
    }
}
