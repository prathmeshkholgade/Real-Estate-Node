'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PropertyDetail.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property',
      });
      // define association here
    }
  }
  PropertyDetail.init({
    property_id: DataTypes.INTEGER,
    area: DataTypes.DECIMAL,
    area_unit: DataTypes.STRING,
    built_up_area: DataTypes.DECIMAL,
    carpet_area: DataTypes.DECIMAL,
    bedrooms: DataTypes.INTEGER,
    bathrooms: DataTypes.INTEGER,
    balconies: DataTypes.INTEGER,
    total_floors: DataTypes.INTEGER,
    property_floor: DataTypes.INTEGER,
    furnishing_status: DataTypes.STRING,
    condition: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PropertyDetail',
  });
  return PropertyDetail;
};