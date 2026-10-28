'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Amenity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Amenity.belongsToMany(models.Property, {
        through: models.PropertyAmenity,
        foreignKey: 'amenity_id',
        otherKey: 'property_id',
        as: 'properties',
      });
      // define association here
    }
  }
  Amenity.init({
    name: DataTypes.STRING,
    category: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Amenity',
  });
  return Amenity;
};