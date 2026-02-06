import { Request, Response, NextFunction } from 'express';

// Mapeo simple de nombres de rol a ids (coincide con inserción inicial en la BD)
const ROLE_MAP: Record<string, number> = {
  estudiante: 1,
  profesor: 2,
  acudiente: 3,
  administrador: 4
};

export function authorizeRoles(...roles: (number | string)[]) {
  // Normaliza a array de números
  const allowed = roles.map(r => typeof r === 'string' ? (ROLE_MAP[r] ?? parseInt(r as string, 10)) : r) as number[];

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('authorize: checking authorization for request:', {
        method: req.method,
        path: req.path,
        params: req.params,
        body: req.body,
        user: req.user
      });

      const user = req.user;

      if (!user) {
        console.error('authorize: req.user is undefined. Headers:', req.headers);
        return res.status(403).json({ 
          error: 'Acceso denegado: token válido pero no se encontró información de usuario',
          token: req.headers.authorization
        });
      }

      console.log('authorize: got user from request:', user);
      const userRol = typeof user.rol === 'string' ? parseInt(user.rol, 10) : user.rol;
      console.log('authorize: parsed role:', { original: user.rol, parsed: userRol });

      if (!allowed.includes(userRol)) {
        console.error('authorize: role not allowed:', {
          userRol,
          allowedRoles: allowed,
          roleMap: ROLE_MAP
        });
        return res.status(403).json({ 
          error: 'Acceso denegado: rol no autorizado', 
          userRol, 
          allowedRoles: allowed,
          roleMapReference: ROLE_MAP 
        });
      }

      console.log('authorize: role check passed:', {
        userRol,
        allowedRoles: allowed
      });

      req.user = { ...user, rol: userRol };
      next();
    } catch (error) {
      console.error('authorize: unexpected error:', error);
      return res.status(500).json({ 
        error: 'Error interno en autorización',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  };
}

// Alias para compatibilidad con import { authorize }
export const authorize = authorizeRoles;
