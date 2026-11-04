'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MaintenanceRequestMedia extends Model {
    static associate(models) {
      MaintenanceRequestMedia.belongsTo(models.MaintenanceRequest, {
        foreignKey: "maintenance_request_id",
        as: "maintenanceRequest",
      });
    }
  }
  MaintenanceRequestMedia.init({
    maintenance_request_id: DataTypes.INTEGER,
    media_url: DataTypes.STRING,
    media_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MaintenanceRequestMedia',
    tableName: 'MaintenanceRequestMedia',
  });
  return MaintenanceRequestMedia;
};