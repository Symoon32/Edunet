import { Request, Response, NextFunction } from 'express';
import { TokenPayload, verifyToken } from '../utils/jwt';

// Extiende el tipo Request para que tenga la propiedad 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('authenticateToken: checking token in request headers');
    const authHeader = req.headers['authorization'];
    console.log('authenticateToken: Authorization header:', authHeader);
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error('authenticateToken: no token found in headers');
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      const decoded = verifyToken(token);
      console.log('authenticateToken: token verified successfully:', decoded);
      req.user = decoded;
      next();
    } catch (err) {
      console.error('authenticateToken: JWT verification error:', err);
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      res.status(403).json({ error: 'Token inválido' });
    }
  } catch (err) {
    console.error('authenticateToken: unexpected error:', err);
    res.status(500).json({ 
      error: 'Error en autenticación',
      details: err instanceof Error ? err.message : String(err)
    });
  }
}

// Alias con nombre más descriptivo para usar en las rutas
export const authMiddleware = authenticateToken;
