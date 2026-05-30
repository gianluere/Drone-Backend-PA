import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AuthenticatedRequest } from './JWTAuth';

export const checkRole = (...roles: UserRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non autenticato' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accesso negato: ruolo non autorizzato' });
      return;
    }

    next();
  };