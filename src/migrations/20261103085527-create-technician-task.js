'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TechnicianTasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      maintenance_request_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "MaintenanceRequests",
          key: "id"
        }
      },
      technician_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Technicians",
          key: "id"
        }
      },
      assigned_by: {
        type: Sequelize.INTEGER
      },
      instructions: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      scheduled_at: {
        type: Sequelize.DATE
      },
      started_at: {
        type: Sequelize.DATE
      },
      completed_at: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('TechnicianTasks');
  }
};