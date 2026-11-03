'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyPurchaseRequest extends Model {
    static associate(models) {
      PropertyPurchaseRequest.belongsTo(models.Property, {
        foreignKey: "property_id",
        as: "property",
      });

      PropertyPurchaseRequest.belongsTo(models.User, {
        foreignKey: "buyer_id",
        as: "buyer",
      });

      PropertyPurchaseRequest.belongsTo(models.PropertySiteVisit, {
        foreignKey: "site_visit_id",
        as: "siteVisit",
      });

      PropertyPurchaseRequest.belongsTo(models.User, {
        foreignKey: "reviewed_by",
        as: "reviewer",
      });

      PropertyPurchaseRequest.hasMany(models.PropertyPurchasePayment, {
        foreignKey: "purchase_request_id",
        as: "payments",
      });

      PropertyPurchaseRequest.hasOne(models.PropertyOwnership, {
        foreignKey: "purchase_request_id",
        as: "ownership",
      });
    }
  }
  PropertyPurchaseRequest.init({
    property_id: DataTypes.INTEGER,
    buyer_id: DataTypes.INTEGER,
    site_visit_id: DataTypes.INTEGER,
    offered_price: DataTypes.DECIMAL,
    agreed_price: DataTypes.DECIMAL,
    message: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "completed"
      ),
      defaultValue: "pending",
    },
    reviewed_by: DataTypes.INTEGER,
    reviewed_at: DataTypes.DATE,
    completed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PropertyPurchaseRequest',
    tableName: 'PropertyPurchaseRequests',
  });
  return PropertyPurchaseRequest;
};