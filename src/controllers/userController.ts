/**
 * User Controller
 *
 * Gestisce gli endpoint relativi agli utenti:
 * - Login e autenticazione
 * - Registrazione di nuovi utenti
 * - Ricarica dei token associati ad un utente
 *
 * Il controller si occupa di:
 * - Validare la presenza dei dati obbligatori nella richiesta
 * - Restituire le risposte HTTP appropriate
 * - Propagare gli errori al middleware di gestione centralizzata
 */

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userServices';
import * as Errors from '../middleware/errors/errorsClass';
import { StatusCodes } from 'http-status-codes';
import { LoginInput, RegisterInput, ChargeTokensInput } from '../validation/userValidator';

const userService = new UserService();

/**
 * Effettua l'autenticazione di un utente.
 *
 * @param req Request contenente email e password nel body.
 * @param res Response HTTP.
 * @param next Middleware successivo per la gestione degli errori.
 * @returns Token JWT e informazioni dell'utente autenticato.
 *
 * @throws BadRequestError Se email o password non sono presenti.
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    if (!email || !password) {
      throw new Errors.BadRequestError('Email e password obbligatori');
    }

    const result = await userService.login(email, password);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Registra un nuovo utente nel sistema.
 *
 * @param req Request contenente email, password e ruolo.
 * @param res Response HTTP.
 * @param next Middleware successivo per la gestione degli errori.
 * @returns Dati dell'utente appena creato.
 *
 * @throws BadRequestError Se email o password non sono presenti.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role } = req.body as RegisterInput;

    if (!email || !password) {
      throw new Errors.BadRequestError('Email e password obbligatori');
    }

    const result = await userService.register({ email, password, role });
    res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Effettua una ricarica di token per un utente.
 *
 * @param req Request contenente userId e amount nel body.
 * @param res Response HTTP.
 * @param next Middleware successivo per la gestione degli errori.
 * @returns Saldo aggiornato dell'utente.
 *
 * @throws BadRequestError Se amount non è un numero positivo.
 */
export const chargeTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = req.body as ChargeTokensInput;

    if (!data.amount || data.amount <= 0) {
      throw new Errors.BadRequestError('Amount deve essere un numero positivo');
    }

    const result = await userService.chargeTokens(data.userId, data.amount);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
}