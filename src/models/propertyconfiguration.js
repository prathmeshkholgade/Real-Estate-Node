'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyConfiguration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PropertyConfiguration.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property',
      });
    }
  }
  PropertyConfiguration.init({
    property_id: DataTypes.INTEGER,
    facing: DataTypes.STRING,
    ownership_type: DataTypes.STRING,
    possession_status: DataTypes.STRING,
    parking_count: DataTypes.INTEGER,
    gated_community: DataTypes.BOOLEAN,
    water_supply: DataTypes.STRING,
    power_backup: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'PropertyConfiguration',
  });
  return PropertyConfiguration;
};