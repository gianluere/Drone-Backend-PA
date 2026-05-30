'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('forbidden_areas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      lat_min: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      lon_min: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      lat_max: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      lon_max: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
      await queryInterface.dropTable('forbidden_areas', { cascade: true });
  },
};