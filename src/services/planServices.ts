import { Op, WhereOptions } from 'sequelize';
import NavigationPlanDAO from '../dao/NavigationPlanDAO';
import { NavigationPlan } from '../models';
import { Waypoint } from '../models';
import { PlanStatus } from '../models/NavigationPlan';
import PDFDocument, { x } from 'pdfkit';
import * as Errors from '../middleware/errors/errorsClass';
import SequelizeSingleton from '../config/database';
import WaypointDAO from '../dao/Waypoint.DAO';
import UserDAO from '../dao/UserDAO';

export interface ListFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const listPlans = async (userId: number, filters: ListFilters): Promise<NavigationPlan[]> => {
  // validazione stato
  let status: PlanStatus | undefined;
  if (filters.status) {
    if (!Object.values(PlanStatus).includes(filters.status as PlanStatus)) {
      throw new Errors.BadRequestError(`Stato non valido, valori ammessi: ${Object.values(PlanStatus).join(', ')}`);
    }
    status = filters.status as PlanStatus;
  }

  // validazione dateFrom
  let dateFrom: Date | undefined;
  if (filters.dateFrom) {
    dateFrom = new Date(filters.dateFrom);
    console.log('dateFrom: ', dateFrom);
    if (isNaN(dateFrom.getTime())) throw new Errors.BadRequestError('dateFrom non valida');
  }

  // validazione dateTo
  let dateTo: Date | undefined;
  if (filters.dateTo) {
    dateTo = new Date(filters.dateTo);
    console.log('dateTo: ', dateTo);
    if (isNaN(dateTo.getTime())) throw new Errors.BadRequestError('dateTo non valida');
  }

  // controllo coerenza date
  if (dateFrom && dateTo && dateFrom > dateTo) {
    console.log('Non può essere');
    throw new Errors.BadRequestError('dateFrom non può essere successiva a dateTo');
  }

  return NavigationPlanDAO.findAllByUser(userId, { status, dateFrom, dateTo });
};

export const exportPdf = (plans: NavigationPlan[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Piani di navigazione', { align: 'center' });
    doc.moveDown();

    if (plans.length === 0) {
      doc.fontSize(12).text('Nessun piano trovato.');
    }

    plans.forEach((plan, i) => {
      doc.fontSize(13).text(`Piano ${i + 1}`, { underline: true });
      doc.fontSize(11)
        .text(`ID: ${plan.id}`)
        .text(`Imbarcazione: ${plan.vesselCode}`)
        .text(`Stato: ${plan.status}`)
        .text(`Inizio: ${plan.startDatetime.toISOString()}`)
        .text(`Fine: ${plan.endDatetime.toISOString()}`);
      doc.moveDown();
    });

    doc.end();
  });
};

export const createNavigationPlan = async (userId: number, data: {
  vesselCode: string;
  startDateTime: Date;
  endDateTime: Date;
  waypoints: { latitude: number; longitude: number; sequenceOrder: number }[];
}): Promise<NavigationPlan> => {

  let user = await UserDAO.findById(userId);

  if (user!.tokenBalance < 5) {
    throw new Errors.ForbiddenError('Token insufficienti per creare un piano di navigazione. Ricarica il tuo account.');
  }

  if (data.vesselCode.length !== 10) throw new Errors.BadRequestError('vesselCode deve essere lungo 10 caratteri');


  const startDateTime = new Date(data.startDateTime);
  if (isNaN(startDateTime.getTime())) throw new Errors.BadRequestError('startDateTime non valida');

  const endDateTime = new Date(data.endDateTime);
  if (isNaN(endDateTime.getTime())) throw new Errors.BadRequestError('endDateTime non valida');

  if (data.waypoints.length < 3) {
    throw new Errors.BadRequestError('waypoints deve contenere almeno 3 elementi');
  }

  const first = data.waypoints[0];
  const last = data.waypoints[data.waypoints.length - 1];
  if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
    throw new Errors.BadRequestError('Il primo e l\'ultimo waypoint devono coincidere per formare una rotta chiusa');
  }

  for (const [index, wp] of data.waypoints.entries()) {
    if (wp.latitude < -90 || wp.latitude > 90) {
      throw new Errors.BadRequestError(`Waypoint ${index + 1}: latitudine deve essere compresa tra -90 e 90`);
    }
    if (wp.longitude < -180 || wp.longitude > 180) {
      throw new Errors.BadRequestError(`Waypoint ${index + 1}: longitudine deve essere compresa tra -180 e 180`);
    }
  }

  /*
  const newPlan = await NavigationPlanDAO.create({
    userId,
    vesselCode: data.vesselCode,
    startDatetime: startDateTime,
    endDatetime: endDateTime
  });

  // Creazione dei waypoint associati al piano
  for (const wp of data.waypoints) {
    await Waypoint.create({
      planId: newPlan.id,
      latitude: wp.latitude,
      longitude: wp.longitude,
      sequenceOrder: wp.sequenceOrder,
    });
  }

  return newPlan;*/

  const t = await SequelizeSingleton.getInstance().transaction();

  //let trans = await SequelizeSingleton.getInstance().transaction(async (t) => {

  //})

  try {
    const newPlan = await NavigationPlanDAO.create({
      userId,
      vesselCode: data.vesselCode,
      startDatetime: startDateTime,
      endDatetime: endDateTime,
    }, t);

    await WaypointDAO.bulkCreate(
      data.waypoints.map(wp => ({
        planId: newPlan.id,
        latitude: wp.latitude,
        longitude: wp.longitude,
        sequenceOrder: wp.sequenceOrder,
      })), t
    );

    await UserDAO.updateTokenBalance(userId, user!.tokenBalance - 5, t);

    await t.commit();
    return newPlan;

  } catch (err) {
    await t.rollback();
    throw err;
  }
}


export const deleteNavigationPlan = async (planId: number, userId: number): Promise<void> => {
  const plan = await NavigationPlanDAO.findById(planId);
  if (!plan) {
    throw new Errors.NotFoundError('Piano di navigazione non trovato');
  }

  if (plan.userId !== userId) {
    throw new Errors.ForbiddenError('Non hai i permessi per cancellare questo piano di navigazione');
  }

  if (plan.status !== PlanStatus.PENDING) {
    throw new Errors.BadRequestError('Solo i piani in stato PENDING possono essere cancellati');
  }

  await NavigationPlanDAO.deleteById(planId);
  //await plan.destroy();
}