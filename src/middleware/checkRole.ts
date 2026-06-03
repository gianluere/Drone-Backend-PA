import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AuthenticatedRequest } from './JWTAuth';
import { StatusCodes } from 'http-status-codes';


/**
 * Middleware che controlla il ruolo autorizzizato passato alla funzione
 * @param roles ruoli che possono essere autorizzati
 * @returns res.status con errore se non autorizzato, altrimenti passa il controllo all'oggetto successivo
 */
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