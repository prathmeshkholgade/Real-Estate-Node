'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FacilityManagementCompany extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FacilityManagementCompany.hasMany(models.PropertyFacilityAssignment, {
        foreignKey: "company_id",
        as: "propertyAssignments",
      });
    }
  }
  FacilityManagementCompany.init({
    company_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    address: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM(
        "pending",
        "active",
        "inactive",
        "suspended"
      ),
    }
  }, {
    sequelize,
    modelName: 'FacilityManagementCompany',
  });
  return FacilityManagementCompany;
};