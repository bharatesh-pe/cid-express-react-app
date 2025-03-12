"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UsersDivision extends Model {
    static associate(models) {
      UsersDivision.belongsTo(models.UsersDepartment, {
        foreignKey: "user_department_id",
        as: "userDepartment",
      });

      UsersDivision.belongsTo(models.Division, {
        foreignKey: "division_id",
        as: "division",
      });

      UsersDivision.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  UsersDivision.init(
    {
      user_division_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_department_id: {
        type: DataTypes.INTEGER,
      },
      division_id: {
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      created_by: {
        type: DataTypes.INTEGER,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "UsersDivision",
      tableName: "users_division",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

  return UsersDivision;
};

