'use strict';

module.exports = {
  up: async (queryInterface) => {
    const plans = await queryInterface.sequelize.query(
      `SELECT id FROM navigation_plans ORDER BY id ASC LIMIT 2`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (plans.length < 2) {
      throw new Error('Esegui prima il seed dei navigation_plans');
    }

    const plan1Id = plans[0].id;
    const plan2Id = plans[1].id;

    await queryInterface.bulkInsert('waypoints', [
      // Piano 1 — rotta chiusa (primo = ultimo punto)
      { plan_id: plan1Id, sequence_order: 1, latitude: 43.600, longitude: 13.500 },
      { plan_id: plan1Id, sequence_order: 2, latitude: 43.650, longitude: 13.550 },
      { plan_id: plan1Id, sequence_order: 3, latitude: 43.700, longitude: 13.500 },
      { plan_id: plan1Id, sequence_order: 4, latitude: 43.600, longitude: 13.500 },

      // Piano 2 — rotta chiusa
      { plan_id: plan2Id, sequence_order: 1, latitude: 44.100, longitude: 14.200 },
      { plan_id: plan2Id, sequence_order: 2, latitude: 44.150, longitude: 14.250 },
      { plan_id: plan2Id, sequence_order: 3, latitude: 44.200, longitude: 14.300 },
      { plan_id: plan2Id, sequence_order: 4, latitude: 44.100, longitude: 14.200 },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('waypoints', null, {});
  },
};