'use strict';
module.exports = {
  up: async (queryInterface) => {
    const operators = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'operator' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const operatorId = operators[0].id;

    await queryInterface.bulkInsert('forbidden_areas', [
      {
        name: 'Zona militare nord',
        description: 'Area riservata uso militare',
        lat_min: 44.000,
        lon_min: 13.000,
        lat_max: 44.500,
        lon_max: 13.500,
        created_by: operatorId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Riserva marina sud',
        description: 'Area protetta, navigazione vietata',
        lat_min: 42.500,
        lon_min: 14.000,
        lat_max: 43.000,
        lon_max: 14.500,
        created_by: operatorId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('forbidden_areas', null, {});
  },
};