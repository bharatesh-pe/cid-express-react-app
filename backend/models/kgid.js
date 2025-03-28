"use strict";

module.exports = (sequelize, DataTypes) => {
  const KGID = sequelize.define(
    "KGID",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      kgid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "KGID",
      tableName: "kgid",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: true, // Automatically manages created_at and updated_at
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );
  KGID.associate = (models) => {
    KGID.hasMany(models.Users, {
      foreignKey: 'kgid_id',
      as: 'users'
    });
  };

  return KGID;
};