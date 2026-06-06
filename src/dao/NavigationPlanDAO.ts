/**
 * Data Access Object (DAO) per la gestione dei Navigation Plans.
 *
 * Questa classe si occupa esclusivamente delle operazioni di accesso ai dati
 * tramite Sequelize, fornendo metodi per creare, recuperare, aggiornare ed
 * eliminare i piani di navigazione.
 *
 * Non contiene logica di business o controlli di autorizzazione, che sono
 * gestiti dal Service layer.
 */

import { Op, Transaction } from 'sequelize';
import { NavigationPlan, Waypoint, User } from '../models/index';
import { PlanStatus } from '../models/NavigationPlan';

class NavigationPlanDAO {

    /**
     * Recupera un piano di navigazione tramite ID.
     *
     * @param id Identificativo del piano.
     * @returns Piano trovato oppure null se inesistente.
     */
    async findById(id: number) {
        return NavigationPlan.findByPk(id);
    }

    /**
     * Recupera un piano di navigazione includendo i waypoint associati.
     *
     * @param id Identificativo del piano.
     * @returns Piano con waypoint oppure null se inesistente.
     */
    async findByIdWithWaypoints(id: number) {
        return NavigationPlan.findByPk(id, {
            include: [{ model: Waypoint, as: 'waypoints' }],
        });
    }

    /**
     * Recupera un piano di navigazione includendo sia i waypoint
     * che l'utente proprietario del piano.
     *
     * @param id Identificativo del piano.
     * @returns Piano completo di waypoint e dati utente.
     */
    async findByIdWithUser(id: number) {
        return NavigationPlan.findByPk(id, {
            include: [
                { model: Waypoint, as: 'waypoints' },
                { model: User, as: 'user' },
            ],
        });
    }

    /**
     * Recupera tutti i piani di navigazione appartenenti ad un utente.
     *
     * Permette di applicare filtri opzionali:
     * - stato del piano
     * - intervallo di date sul campo startDatetime
     *
     * I risultati sono ordinati dal più recente al più vecchio.
     *
     * @param userId Identificativo dell'utente.
     * @param filters Filtri opzionali di ricerca.
     * @returns Elenco dei piani trovati.
     */
    async findAllByUser(userId: number, filters: {
        status?: PlanStatus;
        dateFrom?: Date;
        dateTo?: Date;
    }) {
        const where: Record<string, unknown> = { userId };

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.dateFrom || filters.dateTo) {
            const dateFilter: Record<symbol, Date> = {};
            if (filters.dateFrom) dateFilter[Op.gte] = filters.dateFrom;
            if (filters.dateTo) dateFilter[Op.lte] = filters.dateTo;
            where.startDatetime = dateFilter;
        }
        console.log(where);

        return NavigationPlan.findAll({
            where,
            include: [{ model: Waypoint, as: 'waypoints' }],
            order: [
                ['createdAt', 'DESC'],
                [{ model: Waypoint, as: 'waypoints' }, 'sequenceOrder', 'ASC'],
            ],
        });
    }

    /**
     * Recupera tutti i piani di navigazione.
     *
     * Se viene specificato uno stato, restituisce solo i piani che
     * corrispondono a quello stato.
     *
     * Include waypoint e dati dell'utente associato.
     *
     * @param status Stato opzionale del piano.
     * @returns Elenco dei piani trovati.
     */
    async findAllByStatus(status?: PlanStatus) {
        return NavigationPlan.findAll({
            where: status ? { status } : {},
            include: [
                { model: Waypoint, as: 'waypoints' },
                { model: User, as: 'user', attributes: ['id', 'email', 'role', 'tokenBalance'] },
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: Waypoint, as: 'waypoints' }, 'sequenceOrder', 'ASC'],
            ],
        });
    }

    /**
     * Crea un nuovo piano di navigazione.
     *
     * Supporta l'esecuzione all'interno di una transazione Sequelize.
     *
     * @param data Dati del piano da creare.
     * @param transaction Transazione opzionale.
     * @returns Piano creato.
     */
    async create(data: {
        userId: number;
        vesselCode: string;
        startDatetime: Date;
        endDatetime: Date;
    }, transaction?: Transaction) {
        return NavigationPlan.create(data, { transaction });
    }

    /**
     * Aggiorna lo stato di un piano di navigazione.
     *
     * Utilizzato principalmente durante la fase di revisione da parte
     * di un operatore.
     *
     * @param id Identificativo del piano.
     * @param data Nuovi dati di revisione.
     * @returns Numero di record aggiornati.
     */
    async updateStatus(id: number, data: {
        status: PlanStatus;
        rejectionReason?: string;
        reviewedBy?: number;
        reviewedAt?: Date;
    }) {
        return NavigationPlan.update(data, { where: { id } });
    }

    /**
     * Elimina un piano di navigazione tramite ID.
     *
     * @param id Identificativo del piano.
     * @returns Numero di record eliminati.
     */
    async deleteById(id: number) {
        return NavigationPlan.destroy({ where: { id } });
    }
}

export default new NavigationPlanDAO();