'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UiMergedCases extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UiMergedCases.init({
    case_id: DataTypes.STRING,
    parent_case_id: DataTypes.STRING,
    merged_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UiMergedCases',
  });
  return UiMergedCases;
};