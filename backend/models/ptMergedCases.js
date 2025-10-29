'use strict';

module.exports = (sequelize, DataTypes) => {
  const PtMergedCases = sequelize.define('PtMergedCases', {
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
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'pt_merged_cases',
    underscored: true,
    timestamps: true, // enables Sequelize to auto-update created_at and updated_at
  });

  // Self-association: parent -> children
  PtMergedCases.associate = (models) => {
    PtMergedCases.hasMany(models.PtMergedCases, {
      foreignKey: 'parent_case_id',
      sourceKey: 'case_id',
      as: 'children',
    });
  };

  return PtMergedCases;
};

