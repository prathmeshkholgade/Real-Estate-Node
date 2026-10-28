'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PropertyConfigurations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      property_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      facing: {
        type: Sequelize.STRING
      },
      ownership_type: {
        type: Sequelize.STRING
      },
      possession_status: {
        type: Sequelize.STRING
      },
      parking_count: {
        type: Sequelize.INTEGER
      },
      gated_community: {
        type: Sequelize.BOOLEAN
      },
      water_supply: {
        type: Sequelize.STRING
      },
      power_backup: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PropertyConfigurations');
  }
};