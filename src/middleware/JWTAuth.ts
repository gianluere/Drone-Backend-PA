import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import path from 'path';

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

export const signJWT = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, '\n'), {
    algorithm: 'RS256',
    expiresIn: '1h',
  });
}