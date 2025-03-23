"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UsersDepartment extends Model {
    static associate(models) {
      UsersDepartment.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "user",
      });

      UsersDepartment.belongsTo(models.Department, {
        foreignKey: "department_id",
        as: "department",
      });
    }
  }

  UsersDepartment.init(
    {
      users_department_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: "UsersDepartment",
      tableName: "users_department",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

  return UsersDepartment;
};

