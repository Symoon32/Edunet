"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
exports.authenticateToken = authenticateToken;
const jwt_1 = require("../utils/jwt");
function authenticateToken(req, res, next) {
    try {
        console.log('authenticateToken: checking token in request headers');
        const authHeader = req.headers['authorization'];
        console.log('authenticateToken: Authorization header:', authHeader);
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
        if (!token) {
            console.error('authenticateToken: no token found in headers');
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            console.log('authenticateToken: token verified successfully:', decoded);
            req.user = decoded;
            next();
        }
        catch (err) {
            console.error('authenticateToken: JWT verification error:', err);
            if (err instanceof Error && err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expirado' });
            }
            res.status(403).json({ error: 'Token inválido' });
        }
    }
    catch (err) {
        console.error('authenticateToken: unexpected error:', err);
        res.status(500).json({
            error: 'Error en autenticación',
            details: err instanceof Error ? err.message : String(err)
        });
    }
}
// Alias con nombre más descriptivo para usar en las rutas
exports.authMiddleware = authenticateToken;
