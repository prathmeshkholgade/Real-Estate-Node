'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PropertyDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      area: {
        type: Sequelize.DECIMAL
      },
      area_unit: {
        type: Sequelize.STRING
      },
      built_up_area: {
        type: Sequelize.DECIMAL
      },
      carpet_area: {
        type: Sequelize.DECIMAL
      },
      bedrooms: {
        type: Sequelize.INTEGER
      },
      bathrooms: {
        type: Sequelize.INTEGER
      },
      balconies: {
        type: Sequelize.INTEGER
      },
      total_floors: {
        type: Sequelize.INTEGER
      },
      property_floor: {
        type: Sequelize.INTEGER
      },
      furnishing_status: {
        type: Sequelize.STRING
      },
      condition: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('PropertyDetails');
  }
};