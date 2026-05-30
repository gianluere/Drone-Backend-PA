import { User } from '../models/index';
import { UserRole } from '../models/User';

class UserDAO {
    async findById(id: number) {
        return User.findByPk(id);
    }

    async findByEmail(email: string) {
        return User.findOne({ where: { email } });
    }

    async findAll() {
        return User.findAll();
    }

    async create(data: {
        email: string;
        passwordHash: string;
        role: UserRole;
        tokenBalance: number;
    }) {
        return User.create(data);
    }

    async updateTokenBalance(id: number, tokenBalance: number) {
        return User.update({ tokenBalance }, { where: { id } });
    }

    async deleteById(id: number) {
        return User.destroy({ where: { id } });
    }
}

export default new UserDAO();