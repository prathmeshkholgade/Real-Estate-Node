'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PropertyDocument.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property',
      });
      // define association here
    }
  }
  PropertyDocument.init({
    property_id: DataTypes.INTEGER,
    document_type: DataTypes.STRING,
    file_url: DataTypes.STRING,
    original_name: DataTypes.STRING,
    mime_type: DataTypes.STRING,
    file_size: DataTypes.BIGINT,
    verification_status: DataTypes.STRING,
    rejection_reason: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PropertyDocument',
  });
  return PropertyDocument;
};