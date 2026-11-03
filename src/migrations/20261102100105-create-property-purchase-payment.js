'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PropertyPurchasePayments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      purchase_request_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "PropertyPurchaseRequests",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      amount: {
        type: Sequelize.DECIMAL
      },
      payment_method: {
        type: Sequelize.STRING
      },
      transaction_reference: {
        type: Sequelize.STRING,
      },
      gateway_order_id: {
        type: Sequelize.STRING,
      },
      gateway_payment_id: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "success",
          "failed",
          "refunded"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      paid_at: {
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
    await queryInterface.dropTable('PropertyPurchasePayments');
  }
};