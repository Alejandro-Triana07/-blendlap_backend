import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id_usuario: number;
        correo_electronico: string;
        rol: 'admin' | 'barbero' | 'cliente';
      };
    }
  }
}

// Middleware: verificar que el token sea válido
export const verificarToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ ok: false, mensaje: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = AuthService.verificarToken(token);
    req.usuario = payload;
    next();

  } catch (error) {
    res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado' });
  }
};

// Middleware: verificar roles permitidos
export const verificarRol = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ ok: false, mensaje: 'No autenticado' });
      return;
    }

    if (!roles.includes(req.usuario.rol)) {
      res.status(403).json({ ok: false, mensaje: 'No tienes permisos para esta acción' });
      return;
    }

    next();
  };
};