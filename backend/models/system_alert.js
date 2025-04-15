"use strict";

module.exports = (sequelize, DataTypes) => {
  const System_Alerts = sequelize.define(
    "System_Alerts",
    {
      system_alert_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      approval_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "ui_case_approval",
          key: "approval_id",
        },
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      alert_message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      alert_type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      created_by_designation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "designation",
          key: "designation_id",
        },
      },
      created_by_division_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "division",
          key: "division_id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      send_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
      },
    },
    {
      tableName: "system_alerts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
    }
  );

  System_Alerts.associate = (models) => {
    System_Alerts.belongsTo(models.Users, {
      foreignKey: "created_by",
      as: "creator",
    });

    System_Alerts.belongsTo(models.Users, {
      foreignKey: "send_to",
      as: "receiver",
    });

    System_Alerts.belongsTo(models.UiCaseApproval, {
      foreignKey: "approval_id",
      as: "approval",
    });

    System_Alerts.belongsTo(models.Designation, {
      foreignKey: "created_by_designation_id",
      as: "creatorDesignation",
    });

    System_Alerts.belongsTo(models.Division, {
      foreignKey: "created_by_division_id",
      as: "creatorDivision",
    });

    System_Alerts.hasMany(models.AlertViewStatus, {
      foreignKey: "system_alert_id",
      as: "alert",
    });
  };

  return System_Alerts;
};
