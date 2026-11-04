'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MaintenanceCategory extends Model {
    static associate(models) {
      MaintenanceCategory.hasMany(models.MaintenanceRequest, {
        foreignKey: "category_id",
        as: "maintenanceRequests",
      });
    }
  }
  MaintenanceCategory.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
  }, {
    sequelize,
    modelName: 'MaintenanceCategory',
    tableName: 'MaintenanceCategories',
  });
  return MaintenanceCategory;
};