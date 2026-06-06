import { DataTypes, Model, Optional } from 'sequelize';
import SequelizeSingleton from '../config/database';

/**
 * Attributi del modello ForbiddenArea.
 *
 * Rappresenta un'area geografica vietata alla navigazione,
 * definita tramite bounding box (lat/lon min e max).
 */
interface ForbiddenAreaAttributes {
    id: number;
    name: string;
    description?: string;
    latMin: number;
    lonMin: number;
    latMax: number;
    lonMax: number;
    createdBy: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Attributi richiesti per la creazione di una ForbiddenArea.
 *
 * `id` è auto-generato dal database.
 * `description` è opzionale.
 */
interface ForbiddenAreaCreationAttributes
    extends Optional<ForbiddenAreaAttributes, 'id' | 'description'> { }

/**
 * Modello Sequelize che rappresenta la tabella `forbidden_areas`.
 *
 * Ogni record rappresenta un'area geografica vietata alla navigazione,
 * definita da un rettangolo (bounding box) tramite coordinate GPS.
 */
class ForbiddenArea
    extends Model<ForbiddenAreaAttributes, ForbiddenAreaCreationAttributes>
    implements ForbiddenAreaAttributes {
    declare id: number;
    declare name: string;
    declare description: string;
    declare latMin: number;
    declare lonMin: number;
    declare latMax: number;
    declare lonMax: number;
    declare createdBy: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

/**
 * Inizializzazione del modello ForbiddenArea.
 *
 * Mappa il modello alla tabella `forbidden_areas` nel database.
 */
ForbiddenArea.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        latMin: { type: DataTypes.DOUBLE, allowNull: false, validate: { min: -90, max: 90 } },
        lonMin: { type: DataTypes.DOUBLE, allowNull: false, validate: { min: -180, max: 180 } },
        latMax: { type: DataTypes.DOUBLE, allowNull: false, validate: { min: -90, max: 90 } },
        lonMax: { type: DataTypes.DOUBLE, allowNull: false, validate: { min: -180, max: 180 } },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
        },
    },
    {
        sequelize: SequelizeSingleton.getInstance(),
        modelName: 'ForbiddenArea',
        tableName: 'forbidden_areas',
        underscored: true,
    }
);

export default ForbiddenArea;