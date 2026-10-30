'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FacilityManagementCompany extends Model {
    static associate(models) {
      FacilityManagementCompany.hasMany(models.PropertyFacilityAssignment, {
        foreignKey: "company_id",
        as: "propertyAssignments",
      });

      FacilityManagementCompany.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });
    }
  }

  FacilityManagementCompany.init({
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "active",
        "inactive",
        "suspended"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'FacilityManagementCompany',
    tableName: 'FacilityManagementCompanies',
  });

  return FacilityManagementCompany;
};
