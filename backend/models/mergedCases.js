'use strict';

module.exports = (sequelize, DataTypes) => {
  const UiMergedCases = sequelize.define('UiMergedCases', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    case_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_case_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    merged_status: {
      type: DataTypes.ENUM('parent', 'child'),
      allowNull: false,
    },
  }, {
    tableName: 'ui_merged_cases',
    underscored: true,
    timestamps: true, // This enables created_at and updated_at automatically
  });

  return UiMergedCases;
};
