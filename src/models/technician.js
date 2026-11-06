'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Technician extends Model {
    static associate(models) {
      Technician.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      Technician.belongsTo(models.FacilityManagementCompany, {
        foreignKey: "company_id",
        as: "company",
      });

      Technician.hasMany(models.TechnicianTask, {
        foreignKey: "technician_id",
        as: "technicianTasks",
      });
    }
  }
  Technician.init({
    user_id: DataTypes.INTEGER,
    company_id: DataTypes.INTEGER,
    specialization: DataTypes.STRING,
    experience_years: DataTypes.INTEGER,
    qualification: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Technician',
    tableName: 'Technicians',
  });
  return Technician;
};