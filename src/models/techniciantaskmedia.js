'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TechnicianTaskMedia extends Model {
    static associate(models) {
      TechnicianTaskMedia.belongsTo(models.TechnicianTask, {
        foreignKey: "technician_task_id",
        as: "technicianTask",
      });

      TechnicianTaskMedia.belongsTo(models.User, {
        foreignKey: "uploaded_by",
        as: "uploadedBy",
      });
    }
  }
  TechnicianTaskMedia.init({
    technician_task_id: DataTypes.INTEGER,
    uploaded_by: DataTypes.INTEGER,
    media_url: DataTypes.STRING,
    media_type: DataTypes.STRING,
    stage: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TechnicianTaskMedia',
    tableName: 'TechnicianTaskMedia',
  });
  return TechnicianTaskMedia;
};