'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class folder_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  }
  folder_category.init({
    folder_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    folder_name: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    created_by: DataTypes.INTEGER,
    created_date: DataTypes.DATE,
    modified_by: DataTypes.INTEGER,
    modified_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'folder_categories',
    timestamps: false,
    freezeTableName: true
  });
  return folder_category;
};