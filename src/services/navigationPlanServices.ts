/**
 * Navigation Plan Service
 *
 * Contiene la logica di business relativa ai piani di navigazione.
 *
 * Responsabilità principali:
 * - gestione CRUD dei piani di navigazione
 * - validazione dei filtri di ricerca
 * - gestione transazioni (creazione piano + waypoint + token)
 * - export dei piani in PDF
 * - revisione (approvazione/rifiuto) dei piani
 * - validazione regole di dominio (waypoint, date, stato, permessi)
 *
 * Il service utilizza DAO layer per l'accesso al database e
 * Sequelize transaction per garantire consistenza dei dati.
 */
import NavigationPlanDAO from '../dao/NavigationPlanDAO';
import { NavigationPlan } from '../models';
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

export class NavigationPlanService {

  /**
   * Recupera i piani di navigazione applicando filtri opzionali.
   *
   * Filtri supportati:
   * - status del piano (validato con enum PlanStatus)
   * - intervallo temporale (dateFrom, dateTo)
   *
   * Se viene passato userId, restituisce solo i piani dell'utente.
   *
   * @param filters Filtri di ricerca.
   * @param userId (opzionale) ID utente per cercare i piani dello user, se non indicato viene fatta un.
   * @returns Lista dei piani di navigazione.
   *
   * @throws BadRequestError se i filtri non sono validi.
   */
  async getPlans(filters: ListFilters, userId?: number) {
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
      throw new Errors.BadRequestError('dateFrom non può essere successiva a dateTo');
    }
    if (userId) {
      return NavigationPlanDAO.findAllByUser(userId, { status, dateFrom, dateTo });
    }

    const plans = await NavigationPlanDAO.findAllByStatus(status);
    return plans;
  }

  exportToPdf(plans: NavigationPlan[]): Promise<Buffer> {

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
        console.log(plan.rejectionReason)
        doc.fontSize(13).text(`Piano ${i + 1}`, { underline: true });
        doc.fontSize(11)
          .text(`ID: ${plan.id}`)
          .text(`Imbarcazione: ${plan.vesselCode}`)
          .text(`Stato: ${plan.status}`)
          .text(plan.rejectionReason ? `Motivazione rifiuto: ${plan.rejectionReason}` : '')
          .text(`Inizio: ${plan.startDatetime.toISOString()}`)
          .text(`Fine: ${plan.endDatetime.toISOString()}`);
        doc.moveDown();
      });

      doc.end();
    });

  }

  async createNavigationPlan(userId: number, data: {
    vesselCode: string;
    startDateTime: Date;
    endDateTime: Date;
    waypoints: { latitude: number; longitude: number; sequenceOrder: number }[];
  }): Promise<NavigationPlan> {

    let user = await UserDAO.findById(userId);

    if (user!.tokenBalance < 5) {
      throw new Errors.ForbiddenError('Token insufficienti per creare un piano di navigazione. Ricarica il tuo account.');
    }

    if (data.vesselCode.length !== 10) throw new Errors.BadRequestError('vesselCode deve essere lungo 10 caratteri');
    
    if (isNaN(data.startDateTime.getTime())) throw new Errors.BadRequestError('startDateTime non valida');
    
    if (isNaN(data.endDateTime.getTime())) throw new Errors.BadRequestError('endDateTime non valida');

    if (data.endDateTime.getTime() <= data.startDateTime.getTime()) {
      throw new Errors.BadRequestError('endDateTime deve essere successiva a startDateTime');
    }

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


    /*try {
      return await SequelizeSingleton.getInstance().transaction(async (t) => {
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
  
        return newPlan;
      });
    } catch (err) {
      throw err; 
    }*/

    const t = await SequelizeSingleton.getInstance().transaction();

    try {
      const newPlan = await NavigationPlanDAO.create({
        userId,
        vesselCode: data.vesselCode,
        startDatetime: data.startDateTime,
        endDatetime: data.endDateTime,
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

  async deleteNavigationPlan(planId: number, userId: number) {

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
    await SequelizeSingleton.getInstance().transaction(async (t) => {
      await NavigationPlanDAO.deleteById(planId);
      const user = await UserDAO.findById(userId);
      await UserDAO.updateTokenBalance(userId, user!.tokenBalance + 5, t);

    });

  }

  async reviewNavigationPlan(planId: number, operatorId: number, data: {
    status: 'accepted' | 'rejected';
    rejectionReason?: string;
  }) {

    const plan = await NavigationPlanDAO.findById(planId);
    if (!plan) throw new Errors.NotFoundError('Piano non trovato');

    if (plan.status !== PlanStatus.PENDING) {
      throw new Errors.BadRequestError('Solo i piani in stato pending possono essere valutati');
    }

    if (data.status === 'rejected' && !data.rejectionReason) {
      throw new Errors.BadRequestError('La motivazione è obbligatoria quando si rigetta un piano');
    }

    await NavigationPlanDAO.updateStatus(planId, {
      status: data.status === 'accepted' ? PlanStatus.ACCEPTED : PlanStatus.REJECTED,
      rejectionReason: data.rejectionReason,
      reviewedBy: operatorId,
      reviewedAt: new Date(),
    });

    const updated = await NavigationPlanDAO.findById(planId)

    if (!updated) throw new Errors.NotFoundError('Piano non trovato dopo aggiornamento');
    
    return updated;

  }


}











/*
export const listPlans = async (filters: ListFilters, userId?: number): Promise<NavigationPlan[]> => {
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
  if (userId) {
    return NavigationPlanDAO.findAllByUser(userId, { status, dateFrom, dateTo });
  }
  return NavigationPlanDAO.findAllByStatus(status);
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

*/
/*
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
*/

/*try {
  return await SequelizeSingleton.getInstance().transaction(async (t) => {
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

    return newPlan;
  });
} catch (err) {
  throw err; 
}*/
/*
  const t = await SequelizeSingleton.getInstance().transaction();

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
  await SequelizeSingleton.getInstance().transaction(async (t) => {
    await NavigationPlanDAO.deleteById(planId);
    const user = await UserDAO.findById(userId);
    await UserDAO.updateTokenBalance(userId, user!.tokenBalance + 5, t);

  });

  //await plan.destroy();
}


export const reviewNavigationPlan = async (planId: number, operatorId: number, data: {
  status: 'accepted' | 'rejected';
  rejectionReason?: string;
}): Promise<NavigationPlan> => {

  const plan = await NavigationPlanDAO.findById(planId);
  if (!plan) throw new Errors.NotFoundError('Piano non trovato');

  if (plan.status !== PlanStatus.PENDING) {
    throw new Errors.BadRequestError('Solo i piani in stato pending possono essere valutati');
  }

  if (data.status === 'rejected' && !data.rejectionReason) {
    throw new Errors.BadRequestError('La motivazione è obbligatoria quando si rigetta un piano');
  }

  await NavigationPlanDAO.updateStatus(planId, {
    status: data.status === 'accepted' ? PlanStatus.ACCEPTED : PlanStatus.REJECTED,
    rejectionReason: data.rejectionReason,
    reviewedBy: operatorId,
    reviewedAt: new Date(),
  });

  return NavigationPlanDAO.findById(planId) as Promise<NavigationPlan>;
};
*/