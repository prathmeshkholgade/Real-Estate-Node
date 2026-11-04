'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TechnicianTask extends Model {
    static associate(models) {
      TechnicianTask.belongsTo(models.MaintenanceRequest, {
        foreignKey: "maintenance_request_id",
        as: "maintenanceRequest",
      });

      TechnicianTask.belongsTo(models.Technician, {
        foreignKey: "technician_id",
        as: "technician",
      });

      TechnicianTask.belongsTo(models.User, {
        foreignKey: "assigned_by",
        as: "assignedBy",
      });

      TechnicianTask.hasMany(models.TechnicianTaskMedia, {
        foreignKey: "technician_task_id",
        as: "media",
      });

      TechnicianTask.hasMany(models.TechnicianTaskHistory, {
        foreignKey: "technician_task_id",
        as: "statusHistory",
      });
    }
  }
  TechnicianTask.init({
    maintenance_request_id: DataTypes.INTEGER,
    technician_id: DataTypes.INTEGER,
    assigned_by: DataTypes.INTEGER,
    instructions: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING,
      defaultValue: "assigned",
    },
    scheduled_at: DataTypes.DATE,
    started_at: DataTypes.DATE,
    completed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'TechnicianTask',
    tableName: 'TechnicianTasks',
  });
  return TechnicianTask;
};