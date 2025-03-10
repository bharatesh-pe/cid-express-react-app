'use strict';

module.exports = (sequelize, DataTypes) => {
  const Designation = sequelize.define('Designation', {
    designation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    designation_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'designation',
    timestamps: false
  });

  Designation.associate = (models) => {
    Designation.hasMany(models.UserDesignation, {
      foreignKey: 'designation_id',
      as: 'user_designations'
    });
  };

  return Designation;
};