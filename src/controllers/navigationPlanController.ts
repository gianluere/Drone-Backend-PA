import { Request, Response, NextFunction } from 'express';
//import * as planService from '../services/navigationPlanServices';
import { NavigationPlanService } from '../services/navigationPlanServices';
import { AuthenticatedRequest } from '../middleware/JWTAuth';
import * as Errors from '../middleware/errors/errorsClass';
import { PlanStatus } from '../models/NavigationPlan';
import { StatusCodes } from 'http-status-codes';
import { CreateNavigationPlanInput, ReviewNavigationPlanInput } from '../validation/validator';
import { ForbiddenAreaService } from '../services/forbiddenAreaServices';


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

const isPointInsideBox = (point: Point, box: BoundingBox): boolean => {
  return (
    point.latitude >= box.latMin &&
    point.latitude <= box.latMax &&
    point.longitude >= box.lonMin &&
    point.longitude <= box.lonMax
  );
};

export const listNavigationPlans = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

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

    res.json(plans);
  } catch (err) {
    next(err);
  }
};


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
}


export const createNavigationPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { vesselCode, startDateTime, endDateTime, waypoints } = req.body as CreateNavigationPlanInput;

    if (!vesselCode || !startDateTime || !endDateTime || !waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
      throw new Errors.BadRequestError('Dati del piano di navigazione non validi');
    }

    const forbiddenAreas = (await forbiddenAreaService.getForbiddenAreas());//.sort((a, b) => a.id - b.id);

    console.log('Waypoints ricevuti:', waypoints);
    console.log('Forbidden areas:', forbiddenAreas);

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