'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyPurchasePayment extends Model {
    static associate(models) {
      PropertyPurchasePayment.belongsTo(models.PropertyPurchaseRequest, {
        foreignKey: "purchase_request_id",
        as: "purchaseRequest",
      });
    }
  }
  PropertyPurchasePayment.init({
    purchase_request_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    payment_method: DataTypes.STRING,
    transaction_reference: DataTypes.STRING,
    gateway_order_id: DataTypes.STRING,
    gateway_payment_id: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM(
        "pending",
        "success",
        "failed",
        "refunded"
      ),
      defaultValue: "pending",
    },
    paid_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PropertyPurchasePayment',
    tableName: 'PropertyPurchasePayments',
  });
  return PropertyPurchasePayment;
};