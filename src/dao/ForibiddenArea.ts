import { ForbiddenArea, User } from '../models/index';

class ForbiddenAreaDAO {
    async findAll() {
        return ForbiddenArea.findAll({
            include: [{ model: User, as: 'creator', attributes: ['id', 'email'] }],
            order: [['createdAt', 'DESC']],
        });
    }

    async findById(id: number) {
        return ForbiddenArea.findByPk(id);
    }

    async create(data: {
        name: string;
        description?: string;
        latMin: number;
        lonMin: number;
        latMax: number;
        lonMax: number;
        createdBy: number;
    }) {
        return ForbiddenArea.create(data);
    }

    async update(id: number, data: {
        name?: string;
        description?: string;
        latMin?: number;
        lonMin?: number;
        latMax?: number;
        lonMax?: number;
    }) {
        return ForbiddenArea.update(data, { where: { id } });
    }

    async deleteById(id: number) {
        return ForbiddenArea.destroy({ where: { id } });
    }
}

export default new ForbiddenAreaDAO();