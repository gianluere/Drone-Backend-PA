import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './errorsClass';

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