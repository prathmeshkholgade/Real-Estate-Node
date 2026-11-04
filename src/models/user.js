'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Property, {
        foreignKey: 'user_id',
        as: 'properties',
      });
      User.belongsTo(models.Roles, {
        foreignKey: 'role_id',
        as: 'role',
      });
      User.hasMany(models.FacilityManagementCompany, {
        foreignKey: 'created_by',
        as: 'createdFacilities',
      });
      User.hasMany(models.PropertyFacilityAssignment, {
        foreignKey: 'assigned_by',
        as: 'facilityAssignments',
      });
      User.hasMany(models.PropertySiteVisit, {
        foreignKey: "user_id",
        as: "bookedSiteVisits",
      });

      User.hasMany(models.PropertySiteVisit, {
        foreignKey: "reviewed_by",
        as: "reviewedSiteVisits",
      });
      User.hasMany(models.PropertyPurchaseRequest, {
        foreignKey: "buyer_id",
        as: "buyerPurchaseRequests",
      });

      User.hasMany(models.PropertyPurchaseRequest, {
        foreignKey: "reviewed_by",
        as: "reviewedPurchaseRequests",
      });

      User.hasMany(models.PropertyOwnership, {
        foreignKey: "owner_id",
        as: "ownedProperties",
      });
      User.hasOne(models.Technician, {
        foreignKey: "user_id",
        as: "technicianProfile",
      });

      User.hasMany(models.MaintenanceRequest, {
        foreignKey: "requested_by",
        as: "createdMaintenanceRequests",
      });

      User.hasMany(models.TechnicianTask, {
        foreignKey: "assigned_by",
        as: "assignedTechnicianTasks",
      });

      User.hasMany(models.TechnicianTaskMedia, {
        foreignKey: "uploaded_by",
        as: "uploadedTechnicianTaskMedia",
      });

      User.hasMany(models.TechnicianTaskHistory, {
        foreignKey: "changed_by",
        as: "technicianTaskHistory",
      });

      User.hasOne(models.Technician, {
        foreignKey: "user_id",
        as: "technician",
      });
    }
  }
  User.init({
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
