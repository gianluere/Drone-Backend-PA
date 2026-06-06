import { DataTypes, Model, Optional } from 'sequelize';
import SequelizeSingleton from '../config/database';

/**
 * Costo in token necessario per creare un piano di navigazione.
 */
export const TOKEN_COST_PER_PLAN = 5;

/**
 * Stati possibili di un piano di navigazione.
 *
 * - PENDING: in attesa di revisione
 * - ACCEPTED: approvato dall’operatore
 * - REJECTED: rifiutato dall’operatore
 */
export enum PlanStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

/**
 * Attributi del modello NavigationPlan.
 *
 * Rappresenta un piano di navigazione creato da un utente,
 * che può essere successivamente approvato o rifiutato da un operatore.
 */
interface NavigationPlanAttributes {
    id: number;
    userId: number;
    vesselCode: string;
    startDatetime: Date;
    endDatetime: Date;
    status: PlanStatus;
    rejectionReason?: string;
    reviewedBy?: number;
    reviewedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Attributi necessari per la creazione di un piano di navigazione.
 *
 * - id è auto-generato
 * - status ha valore di default (PENDING)
 */
interface NavigationPlanCreationAttributes extends Optional<NavigationPlanAttributes, 'id' | 'status'> { }

/**
* Modello Sequelize che rappresenta la tabella `navigation_plans`.
*/
class NavigationPlan
    extends Model<NavigationPlanAttributes, NavigationPlanCreationAttributes>
    implements NavigationPlanAttributes {
    declare id: number;
    declare userId: number;
    declare vesselCode: string;
    declare startDatetime: Date;
    declare endDatetime: Date;
    declare status: PlanStatus;
    declare rejectionReason?: string;
    declare reviewedBy?: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

/**
 * Inizializzazione del modello NavigationPlan.
 *
 * Mappa la classe al database e definisce:
 * - vincoli sui dati
 * - relazioni logiche (FK verso users)
 * - validazioni base (es. lunghezza vesselCode)
 */
NavigationPlan.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
        vesselCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                len: [10, 10],
                isAlphanumeric: true,
            },
        },
        startDatetime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDatetime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(PlanStatus)),
            allowNull: false,
            defaultValue: PlanStatus.PENDING,
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reviewedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' },
        },
        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize: SequelizeSingleton.getInstance(),
        modelName: 'NavigationPlan',
        tableName: 'navigation_plans',
        underscored: true,
    }
);

export default NavigationPlan;