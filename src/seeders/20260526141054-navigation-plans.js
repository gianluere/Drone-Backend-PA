'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Recupera gli id degli utenti inseriti
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'user' ORDER BY id ASC LIMIT 2`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const user1Id = users[0].id;
    const user2Id = users[1].id;

    await queryInterface.bulkInsert('navigation_plans', [
      {
        user_id: user1Id,
        vessel_code: 'BOAT000001',
        start_datetime: new Date(Date.now() + 1000 * 60 * 60 * 72), // +72h
        end_datetime:   new Date(Date.now() + 1000 * 60 * 60 * 96), // +96h
        status: 'pending',
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: user2Id,
        vessel_code: 'SHIP000002',
        start_datetime: new Date(Date.now() + 1000 * 60 * 60 * 48), // +48h esatte
        end_datetime:   new Date(Date.now() + 1000 * 60 * 60 * 60), // +60h
        status: 'accepted',
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Recupera i piani appena inseriti
    const plans = await queryInterface.sequelize.query(
      `SELECT id FROM navigation_plans ORDER BY id ASC LIMIT 2`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const plan1Id = plans[0].id;
    const plan2Id = plans[1].id;

    // Waypoint piano 1 — rotta chiusa (primo = ultimo punto)
    await queryInterface.bulkInsert('waypoints', [
      { plan_id: plan1Id, sequence_order: 1, latitude: 40.600, longitude: 12.500 },
      { plan_id: plan1Id, sequence_order: 2, latitude: 41.650, longitude: 12.550 },
      { plan_id: plan1Id, sequence_order: 3, latitude: 42.000, longitude: 12.500 },
      { plan_id: plan1Id, sequence_order: 4, latitude: 40.600, longitude: 12.500 },
    ]);

    // Waypoint piano 2
    await queryInterface.bulkInsert('waypoints', [
      { plan_id: plan2Id, sequence_order: 1, latitude: 40.600, longitude: 15.200 },
      { plan_id: plan2Id, sequence_order: 2, latitude: 41.650, longitude: 15.550 },
      { plan_id: plan2Id, sequence_order: 3, latitude: 42.000, longitude: 16.600 },
      { plan_id: plan2Id, sequence_order: 4, latitude: 40.600, longitude: 15.200 },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('waypoints', null, {});
    await queryInterface.bulkDelete('navigation_plans', null, {});
  },
};