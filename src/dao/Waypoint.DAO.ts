/**
 * Data Access Object per la gestione dei waypoint.
 *
 * Incapsula tutte le operazioni CRUD relative ai waypoint
 * associati ai piani di navigazione.
 */

import { Transaction } from 'sequelize';
import { Waypoint } from '../models/index';

class WaypointDAO {

    /**
     * Recupera tutti i waypoint associati a un piano di navigazione.
     *
     * I risultati sono ordinati per sequenceOrder in modo crescente,
     * così da ricostruire correttamente la rotta.
     *
     * @param planId ID del piano di navigazione.
     * @returns Lista di waypoint ordinati.
     */
    async findByPlanId(planId: number) {
        return Waypoint.findAll({
            where: { planId },
            order: [['sequenceOrder', 'ASC']],
        });
    }

    /**
     * Inserisce più waypoint in una singola operazione bulk.
     *
     * Utile quando si crea un nuovo piano di navigazione,
     * per salvare tutti i punti della rotta in un'unica query.
     *
     * Supporta transazioni per garantire consistenza dei dati.
     *
     * @param waypoints Lista di waypoint da inserire.
     * @param transaction Transazione Sequelize opzionale.
     * @returns Array dei waypoint creati.
     */
    async bulkCreate(waypoints: {
        planId: number;
        sequenceOrder: number;
        latitude: number;
        longitude: number;
    }[], transaction?: Transaction) {
        return Waypoint.bulkCreate(waypoints, { transaction });
    }

    /**
     * Elimina tutti i waypoint associati a un piano di navigazione.
     *
     * Usato principalmente quando un piano viene cancellato.
     *
     * @param planId ID del piano di navigazione.
     * @returns Numero di record eliminati.
     */
    async deleteByPlanId(planId: number) {
        return Waypoint.destroy({ where: { planId } });
    }
}

export default new WaypointDAO();