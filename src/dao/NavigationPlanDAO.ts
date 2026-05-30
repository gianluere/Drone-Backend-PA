import { Op } from 'sequelize';
import { NavigationPlan, Waypoint, User } from '../models/index';
import { PlanStatus } from '../models/NavigationPlan';

class NavigationPlanDAO {

    async findById(id: number) {
        return NavigationPlan.findByPk(id);
    }

    async findByIdWithWaypoints(id: number) {
        return NavigationPlan.findByPk(id, {
            include: [{ model: Waypoint, as: 'waypoints' }],
        });
    }

    async findByIdWithUser(id: number) {
        return NavigationPlan.findByPk(id, {
            include: [
                { model: Waypoint, as: 'waypoints' },
                { model: User, as: 'user' },
            ],
        });
    }

    async findAllByUser(userId: number, filters: {
        status?: PlanStatus;
        dateFrom?: Date;
        dateTo?: Date;
    }) {
        const where: Record<string, unknown> = { userId };

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.dateFrom || filters.dateTo) {
            const dateFilter: Record<symbol, Date> = {};
            if (filters.dateFrom) dateFilter[Op.gte] = filters.dateFrom;
            if (filters.dateTo) dateFilter[Op.lte] = filters.dateTo;
            where.startDatetime = dateFilter;
        }

        return NavigationPlan.findAll({
            where,
            include: [{ model: Waypoint, as: 'waypoints' }],
            order: [['createdAt', 'DESC']],
        });
    }

    async findAllByStatus(status?: PlanStatus) {
        return NavigationPlan.findAll({
            where: status ? { status } : {},
            include: [
                { model: Waypoint, as: 'waypoints' },
                { model: User, as: 'user' },
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    async create(data: {
        userId: number;
        vesselCode: string;
        startDatetime: Date;
        endDatetime: Date;
    }) {
        return NavigationPlan.create(data);
    }

    async updateStatus(id: number, data: {
        status: PlanStatus;
        rejectionReason?: string;
        reviewedBy?: number;
        reviewedAt?: Date;
    }) {
        return NavigationPlan.update(data, { where: { id } });
    }

    async deleteById(id: number) {
        return NavigationPlan.destroy({ where: { id } });
    }
}

export default new NavigationPlanDAO();