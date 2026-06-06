/**
 * Data Access Object (DAO) per la gestione delle Forbidden Areas.
 *
 * Questa classe si occupa esclusivamente dell'accesso ai dati tramite Sequelize,
 * fornendo operazioni CRUD sulle aree vietate.
 *
 * Non contiene logica di business o controlli di autorizzazione, che sono
 * demandati al Service layer.
 */

import { ForbiddenArea, User } from '../models/index';

class ForbiddenAreaDAO {

    /**
     * Recupera tutte le forbidden areas presenti nel database.
     *
     * Include le informazioni essenziali dell'utente che ha creato l'area
     * (id ed email) tramite la relazione "creator".
     *
     * I risultati vengono ordinati per ID crescente.
     *
     * @returns Elenco completo delle forbidden areas.
     */
    async findAll() {
        return ForbiddenArea.findAll({
            include: [{ model: User, as: 'creator', attributes: ['id', 'email'] }],
            order: [['id', 'ASC']],
        });
    }

     /**
     * Recupera una forbidden area tramite il suo ID.
     *
     * @param id Identificativo dell'area.
     * @returns Forbidden area trovata oppure null se inesistente.
     */
    async findById(id: number) {
        return ForbiddenArea.findByPk(id);
    }

    /**
     * Crea una nuova forbidden area.
     *
     * @param data Dati dell'area da creare.
     * @returns Nuova forbidden area creata.
     */
    async create(data: {
        name: string;
        description?: string;
        latMin: number;
        lonMin: number;
        latMax: number;
        lonMax: number;
        createdBy: number;
    }) {
        return ForbiddenArea.create(data);
    }

    /**
     * Aggiorna una forbidden area esistente.
     *
     * Vengono aggiornati esclusivamente i campi presenti nell'oggetto data.
     *
     * @param id Identificativo dell'area da modificare.
     * @param data Campi da aggiornare.
     * @returns Numero di record aggiornati.
     */
    async update(id: number, data: {
        name?: string;
        description?: string;
        latMin?: number;
        lonMin?: number;
        latMax?: number;
        lonMax?: number;
    }) {
        return ForbiddenArea.update(data, { where: { id } });
    }

    /**
     * Elimina una forbidden area tramite ID.
     *
     * @param id Identificativo dell'area da eliminare.
     * @returns Numero di record eliminati.
     */
    async deleteById(id: number) {
        return ForbiddenArea.destroy({ where: { id } });
    }
}

export default new ForbiddenAreaDAO();