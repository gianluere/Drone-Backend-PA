/**
 * Forbidden Area Service
 *
 * Gestisce la logica di business relativa alle aree vietate
 * alla navigazione.
 *
 * Responsabilità:
 * - Recupero delle aree vietate
 * - Creazione di nuove aree vietate
 * - Aggiornamento delle aree vietate esistenti
 * - Eliminazione delle aree vietate
 * - Verifica dei permessi dell'operatore
 * - Validazione dei bounding box geografici
 *
 * Il service delega l'accesso ai dati al ForbiddenAreaDAO e applica
 * le regole di autorizzazione e consistenza dei dati prima di eseguire
 * le operazioni sul database.
 */

import ForbiddenAreaDAO from "../dao/ForbiddenAreaDAO";
import { CreateForbiddenAreaInput, UpdateForbiddenAreaInput } from "../validation/validator";
import * as Errors from '../middleware/errors/errorsClass';

export class ForbiddenAreaService {

    /**
     * Recupera tutte le aree vietate presenti nel sistema.
     *
     * @returns Elenco completo delle aree vietate.
     */
    async getForbiddenAreas() {
        return await ForbiddenAreaDAO.findAll();
    }

    /**
     * Crea una nuova area vietata.
     *
     * L'area viene automaticamente associata all'operator che
     * ha effettuato la richiesta.
     *
     * @param data Dati dell'area da creare.
     * @param operatorId Identificativo dell'operatore autenticato.
     *
     * @returns Area vietata appena creata.
     */
    async createForbiddenArea(data: CreateForbiddenAreaInput, operatorId: number) {
        return await ForbiddenAreaDAO.create({ ...data, createdBy: operatorId });
    }

    /**
     * Aggiorna un'area vietata esistente.
     *
     * Prima dell'aggiornamento vengono effettuati i seguenti controlli:
     * - validità dell'identificativo dell'area;
     * - esistenza dell'area richiesta;
     * - verifica che l'operatore sia il creatore dell'area;
     * - coerenza geografica del bounding box.
     *
     * In particolare vengono garantite le seguenti condizioni:
     * - latMin < latMax
     * - lonMin < lonMax
     *
     * I controlli tengono conto sia dei valori aggiornati sia dei valori
     * già presenti nel database, consentendo aggiornamenti parziali.
     *
     * @param areaId Identificativo dell'area da aggiornare.
     * @param data Campi da modificare.
     * @param operatorId Identificativo dell'operatore autenticato.
     *
     * @returns Area aggiornata.
     *
     * @throws BadRequestError Se l'id non è valido o il bounding box è inconsistente.
     * @throws NotFoundError Se l'area non esiste.
     * @throws ForbiddenError Se l'operatore non è il creatore dell'area.
     */
    async updateForbiddenArea(areaId: number, data: UpdateForbiddenAreaInput, operatorId: number) {

        if (isNaN(areaId)) throw new Errors.BadRequestError('ID non valido, deve essere un numero');

        const area = await ForbiddenAreaDAO.findById(areaId);
        if (!area) {
            throw new Errors.NotFoundError('Forbidden area non trovata');
        }

        if (area.createdBy !== operatorId) {
            throw new Errors.ForbiddenError('Non hai i permessi per modificare quest\'area');
        }

        if (data.latMin !== undefined && data.latMin >= (data.latMax ?? area.latMax)) {
            throw new Errors.BadRequestError('latMin deve essere minore di latMax');
        }

        if (data.latMax !== undefined && data.latMax <= (data.latMin ?? area.latMin)) {
            throw new Errors.BadRequestError('latMax deve essere maggiore di latMin');
        }

        if (data.lonMin !== undefined && data.lonMin >= (data.lonMax ?? area.lonMax)) {
            throw new Errors.BadRequestError('lonMin deve essere minore di lonMax');
        }

        if (data.lonMax !== undefined && data.lonMax <= (data.lonMin ?? area.lonMin)) {
            throw new Errors.BadRequestError('lonMax deve essere maggiore di lonMin');
        }

        await ForbiddenAreaDAO.update(areaId, data);
        return await ForbiddenAreaDAO.findById(areaId);

    }

    /**
     * Elimina un'area vietata esistente.
     *
     * Prima dell'eliminazione vengono effettuati i seguenti controlli:
     * - validità dell'identificativo dell'area;
     * - esistenza dell'area;
     * - verifica che l'operatore sia il creatore dell'area.
     *
     * @param areaId Identificativo dell'area da eliminare.
     * @param operatorId Identificativo dell'operatore autenticato.
     *
     * @throws BadRequestError Se l'id non è valido.
     * @throws NotFoundError Se l'area non esiste.
     * @throws ForbiddenError Se l'operatore non è creatore dell'area.
     */
    async deleteForbiddenArea(areaId: number, operatorId: number) {

        if (isNaN(areaId)) throw new Errors.BadRequestError('ID non valido, deve essere un numero');

        const area = await ForbiddenAreaDAO.findById(areaId);
        if (!area) {
            throw new Errors.NotFoundError('Forbidden area not found');
        }

        if (area.createdBy !== operatorId) {
            throw new Errors.ForbiddenError('Non hai i permessi per eliminare quest\'area');
        }
        await ForbiddenAreaDAO.deleteById(areaId);
    }


}