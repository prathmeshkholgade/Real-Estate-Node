'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Technician extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Technician.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      Technician.belongsTo(models.FacilityManagementCompany, {
        foreignKey: "company_id",
        as: "company",
      });
      // define association here
    }
  }
  Technician.init({
    user_id: DataTypes.INTEGER,
    company_id: DataTypes.INTEGER,
    specialization: DataTypes.STRING,
    experience_years: DataTypes.INTEGER,
    qualification: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Technician',
  });
  return Technician;
};