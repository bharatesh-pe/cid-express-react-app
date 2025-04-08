"use strict";

module.exports = (sequelize, DataTypes) => {
  const AlertViewStatus = sequelize.define(
    "AlertViewStatus",
    {
      alert_view_status_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      system_alert_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      view_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      viewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      viewed_by_designation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      viewed_by_division_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      viewed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "alert_view_status",
      timestamps: false,
      underscored: true,
    }
  );

  AlertViewStatus.associate = (models) => {
    AlertViewStatus.belongsTo(models.System_Alerts, {
      foreignKey: "system_alert_id",
      as: "alert",
    });

    AlertViewStatus.belongsTo(models.Users, {
      foreignKey: "viewed_by",
      as: "viewedByUser",
    });

    AlertViewStatus.belongsTo(models.Designation, {
      foreignKey: "viewed_by_designation_id",
      as: "designation",
    });

    AlertViewStatus.belongsTo(models.Division, {
      foreignKey: "viewed_by_division_id",
      as: "division",
    });
  };

  return AlertViewStatus;
};
