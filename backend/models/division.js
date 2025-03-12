"use strict";

module.exports = (sequelize, DataTypes) => {
  const Division = sequelize.define(
    "Division",
    {
      division_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      division_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "division",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

  Division.associate = (models) => {
    Division.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
    });
  };

  return Division;
};

