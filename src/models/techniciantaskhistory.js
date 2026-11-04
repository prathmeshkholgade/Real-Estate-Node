'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TechnicianTaskHistory extends Model {
    static associate(models) {
      TechnicianTaskHistory.belongsTo(models.TechnicianTask, {
        foreignKey: "technician_task_id",
        as: "technicianTask",
      });

      TechnicianTaskHistory.belongsTo(models.User, {
        foreignKey: "changed_by",
        as: "changedBy",
      });
    }
  }
  TechnicianTaskHistory.init({
    technician_task_id: DataTypes.INTEGER,
    changed_by: DataTypes.INTEGER,
    old_status: DataTypes.STRING,
    new_status: DataTypes.STRING,
    remarks: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'TechnicianTaskHistory',
    tableName: 'TechnicianTaskHistories',
  });
  return TechnicianTaskHistory;
};