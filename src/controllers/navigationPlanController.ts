/**
 * Navigation Plan Controller
 *
 * Gestisce gli endpoint relativi ai piani di navigazione:
 * - elenco dei piani (con filtri e export PDF)
 * - creazione di nuovi piani di navigazione
 * - eliminazione dei piani
 * - revisione (approvazione/rifiuto) dei piani
 *
 * Include anche la validazione delle forbidden areas:
 * ogni waypoint viene verificato contro le aree vietate
 * prima della creazione del piano.
 */

import { Request, Response, NextFunction } from 'express';
import { NavigationPlanService } from '../services/navigationPlanServices';
import { AuthenticatedRequest } from '../middleware/JWTAuth';
import * as Errors from '../middleware/errors/errorsClass';
import { PlanStatus } from '../models/NavigationPlan';
import { StatusCodes } from 'http-status-codes';
import { CreateNavigationPlanInput, ReviewNavigationPlanInput } from '../validation/navigationPlanValidator';
import { ForbiddenAreaService } from '../services/forbiddenAreaServices';
import { UserRole } from '../models/User';


const navigationPlanService = new NavigationPlanService();
const forbiddenAreaService = new ForbiddenAreaService();

type Point = {
  latitude: number;
  longitude: number;
};

type BoundingBox = {
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
};

/**
 * Verifica se un punto geografico è contenuto dentro un bounding box.
 *
 * @param point Punto da verificare.
 * @param box Bounding box dell'area.
 * @returns true se il punto è all'interno dell'area.
 */
const isPointInsideBox = (point: Point, box: BoundingBox): boolean => {
  return (
    point.latitude >= box.latMin &&
    point.latitude <= box.latMax &&
    point.longitude >= box.lonMin &&
    point.longitude <= box.lonMax
  );
};

/**
 * Restituisce la lista dei piani di navigazione dell'utente autenticato.
 *
 * Supporta filtri opzionali:
 * - status del piano
 * - intervallo temporale (dateFrom, dateTo)
 * - formato di output (json o pdf)
 *
 * Se richiesto il formato PDF, viene generato e restituito come download.
 *
 * @param req Request autenticata con query filters.
 * @param res Response HTTP.
 * @param next Middleware error handling.
 */
export const listNavigationPlans = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.role === UserRole.USER ? req.user!.userId : undefined;

    const { status, dateFrom, dateTo, format } = req.query as {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      format?: string;
    };

    if (status) {
      if (!Object.values(PlanStatus).includes(status as PlanStatus)) {
        throw new Errors.BadRequestError('status non valido');
      }
    }

    if (dateFrom && isNaN(Date.parse(dateFrom))) {
      throw new Errors.BadRequestError('dateFrom non valida');
    }

    if (dateTo && isNaN(Date.parse(dateTo))) {
      throw new Errors.BadRequestError('dateTo non valida');

    }

    const plans = await navigationPlanService.getPlans({ status, dateFrom, dateTo }, userId);

    if (userId) {
      if (format !== 'pdf' && format !== 'json' && format !== undefined) {
        throw new Errors.BadRequestError('format non valido, valori ammessi: json, pdf');
      }
      if (format === 'pdf') {
        const pdfBuffer = await navigationPlanService.exportToPdf(plans);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="plans.pdf"');
        res.send(pdfBuffer);
        return;
      }
    }


    res.json(plans);
  } catch (err) {
    next(err);
  }
};

/**
 * Restituisce i piani di navigazione filtrati per status.
 *
 * @param req Request con status nei params.
 * @param res Response HTTP.
 * @param next Middleware error handling.
 *//*
export const listFilteredNavigationPlans = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {

 try {
   const status = req.params.status as string;
   if (!Object.values(PlanStatus).includes(status as PlanStatus)) {
     throw new Errors.BadRequestError('status non valido');
   }
   const plans = await navigationPlanService.getPlans({ status });
   res.json(plans);
 } catch (err) {
   next(err);
 }
}*/


/**
 * Crea un nuovo piano di navigazione.
 *
 * Prima della creazione vengono eseguiti i seguenti controlli:
 * - validazione dei dati obbligatori
 * - verifica che i waypoint non si trovino in forbidden areas
 *
 * Se anche un solo waypoint ricade in un'area vietata,
 * la creazione viene bloccata e viene restituito un errore.
 *
 * @param req Request autenticata contenente il piano.
 * @param res Response HTTP.
 * @param next Middleware error handling.
 */
export const createNavigationPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { vesselCode, startDateTime, endDateTime, waypoints } = req.body as CreateNavigationPlanInput;

    if (!vesselCode || !startDateTime || !endDateTime || !waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
      throw new Errors.BadRequestError('Dati del piano di navigazione non validi');
    }

    const forbiddenAreas = (await forbiddenAreaService.getForbiddenAreas());

    const violation = waypoints.find(wp =>
      forbiddenAreas.some(area =>
        isPointInsideBox(wp, area)
      )
    );

    if (violation) {
      const area = forbiddenAreas.find(a => isPointInsideBox(violation, a));

      throw new Errors.BadRequestError(
        `Waypoint (${violation.latitude}, ${violation.longitude}) entra nella forbidden area ${area?.name}`
      );
    }


    const newPlan = await navigationPlanService.createNavigationPlan(userId, { vesselCode, startDateTime, endDateTime, waypoints });
    res.status(StatusCodes.CREATED).json(newPlan);
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina un piano di navigazione.
 *
 * L'operazione è consentita solo al creatore del piano.
 *
 * @param req Request contenente l'id del piano nei params.
 * @param res Response HTTP.
 * @param next Middleware error handling.
 */
export const deleteNavigationPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const planId = Number(req.params.id);

    if (isNaN(planId)) {
      throw new Errors.BadRequestError('ID del piano non valido');
    }

    await navigationPlanService.deleteNavigationPlan(planId, userId);
    res.status(StatusCodes.NO_CONTENT).send({ message: 'Piano di navigazione eliminato correttamente' });
  } catch (err) {
    next(err);
  }
}


/**
 * Permette ad un operatore di approvare o rifiutare un piano di navigazione.
 *
 * Se il piano viene rifiutato, può essere fornita una motivazione.
 *
 * @param req Request contenente id del piano e dati di review.
 * @param res Response HTTP.
 * @param next Middleware error handling.
 */
export const reviewNavigationPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const planId = Number(req.params.id);
    const operatorId = req.user!.userId;
    const { status, rejectionReason } = req.body as ReviewNavigationPlanInput;

    if (isNaN(planId)) throw new Errors.BadRequestError('ID piano non valido');

    const plan = await navigationPlanService.reviewNavigationPlan(planId, operatorId, { status, rejectionReason });
    res.status(StatusCodes.OK).json(plan);
  } catch (err) {
    next(err);
  }
}