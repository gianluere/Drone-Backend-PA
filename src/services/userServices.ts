/**
 * User Service
 *
 * Contiene la logica di business relativa alla gestione degli utenti:
 * - autenticazione tramite email e password
 * - registrazione di nuovi utenti
 * - gestione del saldo token
 *
 * Il service delega l'accesso ai dati al UserDAO e si occupa di:
 * - validare le regole di business
 * - generare hash delle password
 * - generare JWT per gli utenti autenticati
 * - gestire gli errori applicativi
 */

import bcrypt from 'bcryptjs';
import UserDAO from '../dao/UserDAO';
import { UserRole } from '../models/User';
import { TOKEN_BALANCE_DEFAULT } from '../models/User';
import { signJWT } from '../middleware/JWTAuth';
import { JwtPayload } from '../middleware/JWTAuth';
import * as Errors from '../middleware/errors/errorsClass';

export class UserService {

    /**
     * Autentica un utente tramite email e password.
     *
     * Il metodo:
     * - recupera l'utente tramite email
     * - verifica la password confrontandola con l'hash salvato
     * - genera un JWT contenente le informazioni essenziali dell'utente (id, email, role)
     *
     * @param email Email dell'utente.
     * @param password Password in chiaro fornita dall'utente.
     * @returns Stringa contenente il token JWT.
     *
     * @throws UnauthorizedError Se l'utente non esiste o la password non è corretta.
     */
    async login(email: string, password: string) {
        const user = await UserDAO.findByEmail(email);

        if (!user) {
            throw new Errors.UnauthorizedError('Credenziali non valide');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Errors.UnauthorizedError('Password errata');
        }

        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const token = signJWT(payload);

        return { token };
    }


    /**
     * Registra un nuovo utente nel sistema.
     *
     * Il metodo:
     * - verifica che l'email non sia già registrata
     * - genera l'hash della password
     * - crea il nuovo utente
     * - assegna il saldo iniziale di token agli utenti standard
     * - genera un JWT per consentire l'accesso immediato
     *
     * @param data Dati necessari alla registrazione.
     * @param data.email Email dell'utente.
     * @param data.password Password in chiaro.
     * @param data.role Ruolo dell'utente.
     *
     * @returns Oggetto contenente il token JWT del nuovo utente.
     *
     * @throws ConflictError Se l'email è già associata ad un account esistente.
     */
    async register(data: {
        email: string;
        password: string;
        role: UserRole;
    }) {

        const existing = await UserDAO.findByEmail(data.email);
        if (existing) {
            throw new Errors.ConflictError('Email già registrata');
        }

        const passwordTrimmed = data.password.trim();

        const passwordHash = await bcrypt.hash(passwordTrimmed, 10);

        const user = await UserDAO.create({
            email: data.email,
            passwordHash,
            role: data.role,
            tokenBalance: (data.role === 'user') ? TOKEN_BALANCE_DEFAULT : 0,
        });

        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const token = signJWT(payload);

        return { token };

    }

    /**
     * Effettua una ricarica del saldo token di un utente.
     *
     * Solo gli utenti con ruolo "user" possono possedere e ricaricare token.
     *
     * @param userId Identificativo dell'utente.
     * @param amount Quantità di token da aggiungere.
     *
     * @returns Nuovo saldo token dell'utente.
     *
     * @throws NotFoundError Se l'utente non esiste.
     * @throws BadRequestError Se l'utente non può possedere token.
     */
    async chargeTokens(userId: number, amount: number) {
        const user = await UserDAO.findById(userId);
        if (!user) {
            throw new Errors.NotFoundError('Utente non trovato');
        }

        if (user.role !== 'user') {
            throw new Errors.BadRequestError('Solo gli utenti di tipo "user" possono avere un saldo di token');
        }

        const newBalance = user.tokenBalance + amount;
        await UserDAO.updateTokenBalance(userId, newBalance);

        return { tokenBalance: newBalance };
    }

}