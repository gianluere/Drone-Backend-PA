import { Request, Response, NextFunction } from 'express';
import * as planService from '../services/planServices';
import { AuthenticatedRequest } from '../middleware/JWTAuth';
import * as Errors from '../middleware/errors/errorsClass';
import { PlanStatus } from '../models/NavigationPlan';
import { StatusCodes } from 'http-status-codes';

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

    const plans = await planService.listPlans(userId, { status, dateFrom, dateTo });

    if(format !== 'pdf' && format !== 'json'&& format !== undefined) {
      throw new Errors.BadRequestError('format non valido, valori ammessi: json, pdf');
    }
    if (format === 'pdf') {
      const pdfBuffer = await planService.exportPdf(plans);
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


export const createNavigationPlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { vesselCode, startDateTime, endDateTime, waypoints } = req.body;

    if (!vesselCode || !startDateTime || !endDateTime || !waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
      throw new Errors.BadRequestError('Dati del piano di navigazione non validi');
    }

    const newPlan = await planService.createNavigationPlan(userId, { vesselCode, startDateTime, endDateTime, waypoints });
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

    await planService.deleteNavigationPlan(userId, planId);
    res.status(StatusCodes.GONE).send({ message: 'Piano di navigazione eliminato correttamente' });
  } catch (err) {
    next(err);
  }
}