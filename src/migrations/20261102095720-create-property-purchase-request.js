'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PropertyPurchaseRequests', {
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
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      buyer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "CASCADE",
      },
      site_visit_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "PropertySiteVisits",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      offered_price: {
        type: Sequelize.DECIMAL
      },
      agreed_price: {
        type: Sequelize.DECIMAL
      },
      message: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "accepted",
          "rejected",
          "cancelled",
          "completed"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      reviewed_at: {
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
    await queryInterface.dropTable('PropertyPurchaseRequests');
  }
};