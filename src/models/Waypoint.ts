import { DataTypes, Model, Optional } from 'sequelize';
import SequelizeSingleton from '../config/database';
//import NavigationPlan from './NavigationPlan';

interface WaypointAttributes {
    id: number;
    planId: number;
    sequenceOrder: number;
    latitude: number;
    longitude: number;
}

interface WaypointCreationAttributes extends Optional<WaypointAttributes, 'id'> { }

class Waypoint extends Model<WaypointAttributes, WaypointCreationAttributes>
    implements WaypointAttributes {
    declare id: number;
    declare planId: number;
    declare sequenceOrder: number;
    declare latitude: number;
    declare longitude: number;
}

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

//Waypoint.belongsTo(NavigationPlan, { foreignKey: 'planId', targetKey: 'id', as: 'navigationPlan' });


export default Waypoint;