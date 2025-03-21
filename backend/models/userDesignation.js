'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserDesignation = sequelize.define('UserDesignation', {
    users_designation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // name of the target model
        key: 'user_id' // key in the target model that the foreign key refers to
      }
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Designation', // name of the target model
        key: 'designation_id' // key in the target model that the foreign key refers to
      }
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
    tableName: 'users_designation',
    timestamps: false
  });

  UserDesignation.associate = (models) => {
    UserDesignation.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UserDesignation.belongsTo(models.Designation, {
      foreignKey: 'designation_id',
      as: 'designation'
    });
  };

  return UserDesignation;
};