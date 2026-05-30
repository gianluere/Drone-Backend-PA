import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AuthenticatedRequest } from './JWTAuth';
import { StatusCodes } from 'http-status-codes';

export const checkRole = (...roles: UserRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Non autenticato' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({ error: 'Accesso negato: ruolo non autorizzato' });
      return;
    }

    next();
  };