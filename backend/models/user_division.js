"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const UsersDivision = sequelize.define('UsersDivision', {
    users_division_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    users_department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'UsersDepartment', // name of the target model
        key: 'user_department_id' // key in the target model that the foreign key refers to
      }
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Division', // name of the target model
        key: 'division_id' // key in the target model that the foreign key refers to
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // name of the target model
        key: 'user_id' // key in the target model that the foreign key refers to
      }
    }
  }, {
    tableName: 'users_division',
    timestamps: false
  });

  UsersDivision.associate = (models) => {
    UsersDivision.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UsersDivision.belongsTo(models.Division, {
      foreignKey: 'division_id',
      as: 'division'
    });
    UsersDivision.belongsTo(models.UsersDepartment, {
      foreignKey: 'users_department_id',
      as: 'users_department'
    });
  };

  return UsersDivision;
};
