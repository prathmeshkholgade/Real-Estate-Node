'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyOwnership extends Model {
    static associate(models) {
      PropertyOwnership.belongsTo(models.Property, {
        foreignKey: "property_id",
        as: "property",
      });

      PropertyOwnership.belongsTo(models.User, {
        foreignKey: "owner_id",
        as: "owner",
      });

      PropertyOwnership.belongsTo(models.PropertyPurchaseRequest, {
        foreignKey: "purchase_request_id",
        as: "purchaseRequest",
      });
    }
  }
  PropertyOwnership.init({
    property_id: DataTypes.INTEGER,
    owner_id: DataTypes.INTEGER,
    purchase_request_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    acquired_at: DataTypes.DATE,
    released_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PropertyOwnership',
    tableName: 'PropertyOwnerships',
  });
  return PropertyOwnership;
};