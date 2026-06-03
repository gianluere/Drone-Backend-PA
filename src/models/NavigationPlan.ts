import { DataTypes, Model, Optional } from 'sequelize';
import SequelizeSingleton from '../config/database';

export const TOKEN_COST_PER_PLAN = 5;

export enum PlanStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

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

interface NavigationPlanCreationAttributes
    extends Optional<NavigationPlanAttributes, 'id' | 'status'> { }

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

//NavigationPlan.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' });
//NavigationPlan.hasMany(Waypoint, { foreignKey: 'planId', sourceKey: 'id', as: 'waypoints' });

export default NavigationPlan;