/**
 * @fileoverview Classe con tutti i possibili errori utilizzati nel sistema.
 * Tutte estendono AppError che mette a disposizione il numero per lo StatusCode e il messaggio da mostrare
 */

import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Risorsa non trovata') {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non autenticato') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accesso negato') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Richiesta non valida') {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Risorsa già esistente') {
    super(message, StatusCodes.CONFLICT);
  }
}