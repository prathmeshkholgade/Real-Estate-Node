'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MaintenanceRequest extends Model {
    static associate(models) {
      MaintenanceRequest.belongsTo(models.Property, {
        foreignKey: "property_id",
        as: "property",
      });

      MaintenanceRequest.belongsTo(models.User, {
        foreignKey: "requested_by",
        as: "requester",
      });

      MaintenanceRequest.belongsTo(models.PropertyOwnership, {
        foreignKey: "ownership_id",
        as: "ownership",
      });

      MaintenanceRequest.belongsTo(models.PropertyFacilityAssignment, {
        foreignKey: "facility_assignment_id",
        as: "facilityAssignment",
      });

      MaintenanceRequest.belongsTo(models.MaintenanceCategory, {
        foreignKey: "category_id",
        as: "category",
      });

      MaintenanceRequest.hasMany(models.MaintenanceRequestMedia, {
        foreignKey: "maintenance_request_id",
        as: "media",
      });

      MaintenanceRequest.hasOne(models.TechnicianTask, {
        foreignKey: "maintenance_request_id",
        as: "technicianTask",
      });
    }
  }
  MaintenanceRequest.init({
    property_id: DataTypes.INTEGER,
    requested_by: DataTypes.INTEGER,
    ownership_id: DataTypes.INTEGER,
    facility_assignment_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    priority: {
      type: DataTypes.STRING,
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
  }, {
    sequelize,
    modelName: 'MaintenanceRequest',
    tableName: 'MaintenanceRequests',
  });
  return MaintenanceRequest;
};