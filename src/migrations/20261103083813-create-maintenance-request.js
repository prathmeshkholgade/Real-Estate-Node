'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MaintenanceRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      property_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Properties",
          key: "id"
        }
      },
      requested_by: {
        type: Sequelize.INTEGER
      },
      ownership_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "PropertyOwnerships",
          key: "id"
        }
      },
      facility_assignment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "PropertyFacilityAssignments",
          key: "id"
        }
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "MaintenanceCategories",
          key: "id"
        }
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      priority: {
        type: Sequelize.STRING
      },
      status: {
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
    await queryInterface.dropTable('MaintenanceRequests');
  }
};