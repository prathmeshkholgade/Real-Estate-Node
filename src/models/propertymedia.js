'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyMedia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PropertyMedia.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property',
      });
      // define association here
    }
  }
  PropertyMedia.init({
    property_id: DataTypes.INTEGER,
    media_type: DataTypes.STRING,
    file_url: DataTypes.STRING,
    thumbnail_url: DataTypes.STRING,
    original_name: DataTypes.STRING,
    mime_type: DataTypes.STRING,
    file_size: DataTypes.BIGINT,
    is_primary: DataTypes.BOOLEAN,
    sort_order: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PropertyMedia',
  });
  return PropertyMedia;
};