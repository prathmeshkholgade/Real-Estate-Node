'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PropertySiteVisit extends Model {
    static associate(models) {
      PropertySiteVisit.belongsTo(models.Property, {
        foreignKey: "property_id",
        as: "property",
      });
      PropertySiteVisit.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      PropertySiteVisit.belongsTo(models.User, {
        foreignKey: "reviewed_by",
        as: "reviewer",
      });
      PropertySiteVisit.hasMany(models.PropertyPurchaseRequest, {
        foreignKey: "site_visit_id",
        as: "purchaseRequests",
      });
    }
  }

  PropertySiteVisit.init({
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preferred_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "rejected",
        "cancelled",
        "completed"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    scheduled_start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    scheduled_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'PropertySiteVisit',
    tableName: 'PropertySiteVisits',
  });

  return PropertySiteVisit;
};
