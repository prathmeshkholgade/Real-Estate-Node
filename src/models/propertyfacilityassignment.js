'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyFacilityAssignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PropertyFacilityAssignment.belongsTo(models.Property, {
        foreignKey: "property_id",
        as: "property",
      });

      PropertyFacilityAssignment.belongsTo(models.FacilityManagementCompany, {
        foreignKey: "company_id",
        as: "company",
      });

      PropertyFacilityAssignment.belongsTo(models.User, {
        foreignKey: "assigned_by",
        as: "assignedBy",
      });


    }
  }
  PropertyFacilityAssignment.init({
    property_id: DataTypes.INTEGER,
    company_id: DataTypes.INTEGER,
    assigned_by: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PropertyFacilityAssignment',
  });
  return PropertyFacilityAssignment;
};