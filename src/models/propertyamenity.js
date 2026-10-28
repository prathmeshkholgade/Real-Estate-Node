'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyAmenity extends Model {

    static associate(models) {
      // define association here
    }
  }
  PropertyAmenity.init({
    property_id: DataTypes.INTEGER,
    amenity_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PropertyAmenity',
  });
  return PropertyAmenity;
};