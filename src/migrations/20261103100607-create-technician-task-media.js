'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TechnicianTaskMedia', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      technician_task_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "TechnicianTasks",
          key: "id"
        }
      },
      uploaded_by: {
        type: Sequelize.INTEGER
      },
      media_url: {
        type: Sequelize.STRING
      },
      media_type: {
        type: Sequelize.STRING
      },
      stage: {
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
    await queryInterface.dropTable('TechnicianTaskMedia');
  }
};