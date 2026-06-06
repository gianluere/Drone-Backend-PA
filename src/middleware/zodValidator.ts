/**
 * @fileoverview Middlware per la validazione dei dati tramite Zod
 */

import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { StatusCodes } from 'http-status-codes';

/**
 * Funzione che effettua la validazione dei dati. Se a buon termine li converte e li aggiunge nel req.body
 * @param schema Schema che si vuole utilizzare per fare la validazione dei dati
 * @returns Risposta Http con errore se i dati inviati non rispettano lo schema altrimenti passa il controllo all'oggetto successivo
 */
export const zodValidate = (schema: ZodType) =>
    (req: Request, res: Response, next: NextFunction): void => {

        const result = schema.safeParse(req.body);

        if (!result.success) {

            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                errors: result.error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
            return;
        }

        req.body = result.data;
        next();
    };