'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PropertyDocuments', {
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
      document_type: Sequelize.STRING,
      file_url: {
        type: Sequelize.STRING(2048),
        allowNull: false,
      },
      original_name: Sequelize.STRING,
      mime_type: Sequelize.STRING,
      file_size: Sequelize.BIGINT,
      verification_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      rejection_reason: Sequelize.TEXT,
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
    await queryInterface.dropTable('PropertyDocuments');
  }
};