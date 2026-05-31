import { Transaction } from 'sequelize';
import { Waypoint } from '../models/index';

class WaypointDAO {
    async findByPlanId(planId: number) {
        return Waypoint.findAll({
            where: { planId },
            order: [['sequenceOrder', 'ASC']],
        });
    }

    async bulkCreate(waypoints: {
        planId: number;
        sequenceOrder: number;
        latitude: number;
        longitude: number;
    }[], transaction?: Transaction) {
        return Waypoint.bulkCreate(waypoints, { transaction });
    }

    async deleteByPlanId(planId: number) {
        return Waypoint.destroy({ where: { planId } });
    }
}

export default new WaypointDAO();