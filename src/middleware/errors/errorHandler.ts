/**
 * @fileoverview Middleware per gestire gli errori
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './errorsClass';


/**
 * Funzione per gestire gli errori.
 * @param err Errore che viene generato dalle varie funzioni e rilevato tramite try/catch
 * @param req 
 * @param res Risposta http che viene inviata
 * @param next 
 * @returns Se l'errore appartienene alla AppError viene inviata una risposta basata su quell'oggetto, altrimenti una generica risposta d'errore
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      error: err.message,
    });
    return;
  }

  console.error('Errore non gestito:', err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: 'Errore interno del server',
  });
};