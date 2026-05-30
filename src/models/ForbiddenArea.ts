import { DataTypes, Model, Optional } from 'sequelize';
import SequelizeSingleton from '../config/database';

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

interface ForbiddenAreaCreationAttributes
    extends Optional<ForbiddenAreaAttributes, 'id' | 'description'> { }

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

ForbiddenArea.init(
    {
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
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