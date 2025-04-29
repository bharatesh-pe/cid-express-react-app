"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Designation extends Model {
    static associate(models) {
      
    }
  }

  Designation.init(
    {
      designation_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      designation_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
     },
     division_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
     },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Designation",
      tableName: "designation",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

  
  Designation.associate = (models) => {
    Designation.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
    });
    Designation.belongsTo(models.Division, {
      foreignKey: "division_id",
      as: "division",
    });
  };

  return Designation;
};

