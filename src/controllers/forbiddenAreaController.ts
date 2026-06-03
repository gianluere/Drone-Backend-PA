/**
 * Forbidden Area Controller
 *
 * Gestisce gli endpoint relativi alle aree private alla navigazione.
 *
 * Responsabilità:
 * - Recupero delle aree vietate
 * - Creazione di nuove aree vietate
 * - Aggiornamento delle aree vietate esistenti
 * - Eliminazione delle aree vietate
 *
 * Si occupa della gestione delle richieste HTTP e delle relative risposte.
 */

import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from "http-status-codes";
import { ForbiddenAreaService } from "../services/forbiddenAreaServices";
import { CreateForbiddenAreaInput, UpdateForbiddenAreaInput } from "../validation/forbiddenAreaValidator";
import { AuthenticatedRequest } from '../middleware/JWTAuth';


const forbiddenAreaService = new ForbiddenAreaService();

/**
 * Recupera tutte le aree private presenti nel sistema.
 *
 * @param req Request HTTP.
 * @param res Response HTTP.
 * @param next Middleware successivo per la gestione degli errori.
 *
 * @returns Elenco delle aree private.
 */
export const getForbiddenArea = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const areas = await forbiddenAreaService.getForbiddenAreas();
        res.status(StatusCodes.OK).json(areas);
    } catch (err) {
        next(err);
    }
}


/**
 * Crea una nuova area privata.
 *
 * L'area viene associata all'operator autenticato che effettua la richiesta.
 *
 * @param req Request contenente i dati dell'area nel body.
 * @param res Response HTTP.
 * @param next Middleware successivo per la gestione degli errori.
 *
 * @returns Area privata appena creata.
 */
export const createForbiddenArea = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = req.body as CreateForbiddenAreaInput;
        const area = await forbiddenAreaService.createForbiddenArea(
            data,
            req.user!.userId
        );
        res.status(StatusCodes.CREATED).json({ success: true, data: area });
    } catch (err) {
        next(err);
    }
}

/**
 * Aggiorna un'area privata esistente.
 *
 * L'operazione è consentita solamente all'operatore che ha creato l'area privata.
 *
 * @param req Request contenente l'id dell'area nei parametri
 *            e i dati da aggiornare nel body.
 * @param res Response HTTP.
 * @param next Middleware successivo per la gestione degli errori.
 *
 * @returns Area privata aggiornata.
 */
export const updateForbiddenArea = async (req: AuthenticatedRequest, res: any, next: any) => {
    try {
        const areaId = Number(req.params.id);
        const data = req.body as UpdateForbiddenAreaInput;
        const area = await forbiddenAreaService.updateForbiddenArea(
            areaId,
            data,
            req.user!.userId
        );
        res.status(StatusCodes.OK).json({ success: true, data: area });
    } catch (err) {
        next(err);
    }
}

/**
 * Elimina un'area privata esistente.
 *
 * L'operazione è consentita solamente all'operator che ha creato l'area privata.
 *
 * @param req Request contenente l'id dell'area nei parametri.
 * @param res Response HTTP.
 * @param next Middleware successivo per la gestione degli errori.
 *
 * @returns Risposta HTTP 204 No Content in caso di eliminazione riuscita.
 */
export const deleteForbiddenArea = async (req: any, res: any, next: any) => {
    try {
        const areaId = parseInt(req.params.id);
        await forbiddenAreaService.deleteForbiddenArea(areaId, req.user!.userId);
        res.status(StatusCodes.NO_CONTENT).send();
    } catch (err) {
        next(err);
    }
}