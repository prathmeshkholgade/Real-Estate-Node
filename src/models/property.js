'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Property.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'owner',
      });
      Property.hasOne(models.PropertyDetail, {
        foreignKey: 'property_id',
        as: 'details',
      });
      Property.hasOne(models.PropertyConfiguration, {
        foreignKey: 'property_id',
        as: 'configuration',
      });
      Property.hasMany(models.PropertyMedia, {
        foreignKey: 'property_id',
        as: 'media',
      });
      Property.hasMany(models.PropertyDocument, {
        foreignKey: 'property_id',
        as: 'documents',
      });
      Property.belongsToMany(models.Amenity, {
        through: models.PropertyAmenity,
        foreignKey: 'property_id',
        otherKey: 'amenity_id',
        as: 'amenities',
      });
    }
  }
  Property.init({
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    property_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    listing_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'draft',
    },
    current_step: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    postal_code: DataTypes.STRING,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    locality: DataTypes.STRING,
    address: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Property',
  });
  return Property;
};
