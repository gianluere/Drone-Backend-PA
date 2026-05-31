import { DataTypes, Model, Optional } from 'sequelize';
import SequelizeSingleton from '../config/database';

export type UserRole = 'user' | 'operator' | 'admin';
export const TOKEN_BALANCE_DEFAULT : number = 30;

interface UserAttributes {
    id: number;
    email: string;
    passwordHash: string;
    role: UserRole;
    tokenBalance: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'tokenBalance'> { }

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
            type: DataTypes.ENUM('user', 'operator', 'admin'),
            allowNull: false,
            defaultValue: 'user',
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

//User.hasMany(NavigationPlan, { foreignKey: 'userId', sourceKey: 'id', as: 'navigationPlans' });

export default User;