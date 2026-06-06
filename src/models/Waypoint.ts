import { DataTypes, Model, Optional } from 'sequelize';
import SequelizeSingleton from '../config/database';

/**
 * Attributi del modello Waypoint.
 *
 * Un waypoint rappresenta un punto geografico appartenente
 * a un piano di navigazione, ordinato tramite sequenceOrder.
 */
interface WaypointAttributes {
    id: number;
    planId: number;
    sequenceOrder: number;
    latitude: number;
    longitude: number;
}

/**
 * Attributi necessari per la creazione di un waypoint.
 *
 * `id` è auto-generato dal database.
 */
interface WaypointCreationAttributes extends Optional<WaypointAttributes, 'id'> { }

/**
 * Modello Sequelize che rappresenta la tabella `waypoints`.
 *
 * Ogni waypoint:
 * - appartiene a un NavigationPlan (FK planId)
 * - rappresenta un punto geografico (lat/lon)
 * - ha un ordine sequenziale per ricostruire la rotta
 */
class Waypoint extends Model<WaypointAttributes, WaypointCreationAttributes>
    implements WaypointAttributes {
    declare id: number;
    declare planId: number;
    declare sequenceOrder: number;
    declare latitude: number;
    declare longitude: number;
}

/**
 * Inizializzazione del modello Waypoint.
 *
 * Mappa la classe alla tabella `waypoints` nel database.
 */
Waypoint.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        planId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'navigation_plans', key: 'id' },
        },
        sequenceOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: { min: -90, max: 90 },
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: { min: -180, max: 180 },
        },
    },
    {
        sequelize: SequelizeSingleton.getInstance(),
        modelName: 'Waypoint',
        tableName: 'waypoints',
        underscored: true,
        timestamps: false,
    }
);

export default Waypoint;