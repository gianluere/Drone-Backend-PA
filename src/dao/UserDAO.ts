/**
 * Data Access Object per la gestione degli utenti.
 *
 * Incapsula tutte le operazioni di accesso al database
 * relative alla tabella users.
 */

import { Transaction } from 'sequelize';
import { User } from '../models/index';
import { UserRole } from '../models/User';

class UserDAO {

    /**
     * Recupera un utente tramite ID.
     *
     * @param id Identificativo dell'utente.
     * @returns Utente trovato oppure null.
     */
    async findById(id: number) {
        return User.findByPk(id);
    }

    /**
     * Recupera un utente tramite email.
     *
     * Utilizzato principalmente durante il login
     * e la registrazione per verificare l'univocità dell'email.
     *
     * @param email Email dell'utente.
     * @returns Utente trovato oppure null.
     */
    async findByEmail(email: string) {
        return User.findOne({ where: { email } });
    }

    /**
     * Recupera tutti gli utenti presenti nel sistema.
     *
     * @returns Lista completa degli utenti.
     */
    async findAll() {
        return User.findAll();
    }

    /**
     * Crea un nuovo utente nel database.
     *
     * @param data Dati necessari alla creazione dell'utente.
     * @returns Utente appena creato.
     */
    async create(data: {
        email: string;
        passwordHash: string;
        role: UserRole;
        tokenBalance: number;
    }) {
        return User.create(data);
    }

    /**
     * Aggiorna il saldo token di un utente.
     *
     * Può essere eseguito all'interno di una transazione
     * per garantire la consistenza dei dati.
     *
     * @param id ID dell'utente.
     * @param tokenBalance Nuovo saldo token.
     * @param transaction Transazione Sequelize opzionale.
     * @returns Numero di record aggiornati.
     */
    async updateTokenBalance(id: number, tokenBalance: number, transaction?: Transaction) {
        return User.update({ tokenBalance }, { where: { id }, transaction });
    }

    /**
     * Elimina un utente tramite ID.
     *
     * @param id ID dell'utente da eliminare.
     * @returns Numero di record eliminati.
     */
    async deleteById(id: number) {
        return User.destroy({ where: { id } });
    }
}

export default new UserDAO();