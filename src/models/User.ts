import { DataTypes, Model, Optional } from 'sequelize';
import SequelizeSingleton from '../config/database';

/**
 * Ruoli disponibili per un utente nel sistema.
 *
 * - USER: utente standard con permessi base
 * - OPERATOR: operatore con permessi di gestione/validazione
 * - ADMIN: amministratore può ricaricare il saldo dello user
 */
export enum UserRole {
  USER = 'user',
  OPERATOR = 'operator',
  ADMIN = 'admin',
}

/**
 * Valore di default assegnato al saldo token di un utente.
 */
export const TOKEN_BALANCE_DEFAULT : number = 30;

/**
 * Attributi completi del modello User.
 */
interface UserAttributes {
    id: number;
    email: string;
    passwordHash: string;
    role: UserRole;
    tokenBalance: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Attributi necessari per la creazione di un utente.
 *
 * `id` e `tokenBalance` sono opzionali perché:
 * - id è auto-incrementale
 * - tokenBalance ha un default value
 */
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'tokenBalance'> { }

/**
 * Modello Sequelize che rappresenta la tabella `users`.
 */
class User extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {
    declare id: number;
    declare email: string;
    declare passwordHash: string;
    declare role: UserRole;
    declare tokenBalance: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

/**
 * Inizializzazione del modello User.
 *
 * Mappa la classe TypeScript alla tabella SQL `users`.
 */
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.USER,
        },
        tokenBalance: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: TOKEN_BALANCE_DEFAULT,
            validate: { min: 0 },
        },
    },
    {
        sequelize: SequelizeSingleton.getInstance(),
        modelName: 'User',
        tableName: 'users',
        underscored: true,
    }
);

export default User;