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
import { TOKEN_COST_PER_PLAN } from '../models/NavigationPlan';

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

  /**
   * Esporta una lista di piani di navigazione in formato PDF.
   *
   * Il PDF contiene:
   * - informazioni principali del piano
   * - stato del piano
   * - eventuale motivazione di rifiuto
   * - date di inizio e fine
   *
   * @param plans Lista di piani da esportare.
   * @returns Buffer contenente il PDF generato.
   */
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

        const waypoints = (plan as any).waypoints as { sequenceOrder: number; latitude: number; longitude: number }[];
        if (waypoints && waypoints.length > 0) {
          doc.fontSize(11).text('Waypoints:');
          waypoints.forEach((wp) => {
            doc.fontSize(10).text(`  ${wp.sequenceOrder}. Lat: ${wp.latitude}, Lon: ${wp.longitude}`);
          });
        }

        doc.moveDown();
      });

      doc.end();
    });

  }

  /**
   * Crea un nuovo piano di navigazione.
   *
   * Operazioni eseguite:
   * - verifica saldo token dell'utente
   * - validazione vesselCode (lunghezza 10)
   * - validazione date di inizio e fine
   * - controllo coerenza temporale (end > start)
   * - validazione waypoint (minimo 3, rotta chiusa)
   * - validazione coordinate geografiche
   *
   * La creazione avviene in transazione:
   * - creazione NavigationPlan
   * - inserimento Waypoints
   * - scalamento token utente
   *
   * @param userId ID utente che crea il piano.
   * @param data Dati del piano di navigazione.
   * @returns Piano creato.
   *
   * @throws ForbiddenError se token insufficienti.
   * @throws BadRequestError se dati non validi.
   */
  async createNavigationPlan(userId: number, data: {
    vesselCode: string;
    startDateTime: Date;
    endDateTime: Date;
    waypoints: { latitude: number; longitude: number; sequenceOrder: number }[];
  }): Promise<NavigationPlan> {

    let user = await UserDAO.findById(userId);

    if (user!.tokenBalance < TOKEN_COST_PER_PLAN) {
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

      await UserDAO.updateTokenBalance(userId, user!.tokenBalance - TOKEN_COST_PER_PLAN, t);

      await t.commit();
      return newPlan;


    } catch (err) {
      await t.rollback();
      throw err;
    }

  }

  /**
   * Elimina un piano di navigazione.
   *
   * Condizioni:
   * - il piano deve esistere
   * - il piano deve appartenere all'utente che ha fatto la richiesta
   * - il piano deve essere in stato PENDING
   *
   * In caso di eliminazione viene anche rimborsato il credito token.
   *
   * @param planId ID del piano.
   * @param userId ID utente richiedente.
   *
   * @throws NotFoundError se il piano non esiste.
   * @throws ForbiddenError se l'utente non è proprietario.
   * @throws BadRequestError se il piano non è eliminabile (non è in stato di PENDING).
   */
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

  /**
   * Permette la revisione di un piano di navigazione da parte dell'operatore.
   *
   * Solo i piani in stato PENDING possono essere valutati.
   *
   * Se il piano viene rifiutato, è obbligatoria la motivazione.
   *
   * @param planId ID del piano.
   * @param operatorId ID dell'operatore che esegue la review.
   * @param data Esito della revisione (accepted/rejected) e motivazione di rifiuto se necessaria.
   *
   * @returns Piano aggiornato.
   *
   * @throws NotFoundError se il piano non esiste.
   * @throws BadRequestError se il piano non è in stato PENDING o dati invalidi.
   */
  async reviewNavigationPlan(planId: number, operatorId: number, data: {
    status: PlanStatus.ACCEPTED | PlanStatus.REJECTED;
    rejectionReason?: string;
  }) {

    const plan = await NavigationPlanDAO.findById(planId);
    if (!plan) throw new Errors.NotFoundError('Piano non trovato');

    if (plan.status !== PlanStatus.PENDING) {
      throw new Errors.BadRequestError('Solo i piani in stato pending possono essere valutati');
    }

    if (data.status === PlanStatus.REJECTED && !data.rejectionReason) {
      throw new Errors.BadRequestError('La motivazione è obbligatoria quando si rigetta un piano');
    }

    await NavigationPlanDAO.updateStatus(planId, {
      status: data.status,
      rejectionReason: data.rejectionReason,
      reviewedBy: operatorId,
      reviewedAt: new Date(),
    });

    const updated = await NavigationPlanDAO.findById(planId)

    if (!updated) throw new Errors.NotFoundError('Piano non trovato dopo aggiornamento');

    return updated;

  }

}