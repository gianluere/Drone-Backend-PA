/**
 * @fileoverview Middleware per l'autenticazione JWT. Contiene funzioni per verificare la presenza e validità del token JWT nelle richieste, decodificare il payload e firmare nuovi token JWT.
 * Utilizza la libreria jsonwebtoken per la gestione dei token JWT e supporta l'algoritmo RS256 per la firma e verifica dei token.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { StatusCodes } from 'http-status-codes';

//const public_key = fs.readFileSync(path.resolve(__dirname, 'jwtRS256.key.pub'), 'utf8');


export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

// estende Request per aggiungere user
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
  

/**
 * Middleware per verificare la presenza e validità del token JWT nelle richieste.
 * Controlla che il token sia presente nell'header Authorization.
 * Che sia nel formato corretto (Bearer <token>) e che sia valido e non scaduto.
 * Se il token è valido, decodifica il payload e lo salva nella request per essere utilizzato nei controller successivi.
 * In caso di errori, restituisce una risposta con status 401 Unauthorized
 * @param req Richiesta Http
 * @param res Risposta Http
 * @param next 
 * @returns Errore con statusCode se ci sono problemi con il token, altrimenti passa il controllo all'oggetto successivo
 */
export const checkAndVerifyJWT = (req: Request, res: Response, next: NextFunction): void => {
  const rawToken = req.headers.authorization;

  // 1. header presente?
  if (!rawToken) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Auth token not available in the header' });
    return;
  }

  // 2. formato corretto?
  const splittedRawToken = rawToken.split(' ');
  if (splittedRawToken.length !== 2 || splittedRawToken[0] !== 'Bearer') {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Auth token is not in the correct format' });
    return;
  }

  // 3. verifica il token
  try {
    const decoded = jwt.verify(
      splittedRawToken[1],
      //process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n'),
      //public_key,
      process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n'),
      { algorithms: ['RS256'] }
    ) as JwtPayload;

    (req as AuthenticatedRequest).user = decoded; // salvo il payload decodificato nella request
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Token non valido o scaduto' });
  }
};


/**
 * Funzione per firmare un nuovo token JWT con un payload specificato.
 * Utilizza l'algoritmo RS256 e una chiave privata per la firma.
 * Il token generato ha una scadenza di 1 ora.
 * Restituisce il token JWT firmato come stringa.
 */
export const signJWT = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, '\n'), {
    algorithm: 'RS256',
    expiresIn: '1h',
  });
}