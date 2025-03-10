'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserDesignation = sequelize.define('UserDesignation', {
    user_designation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'designation', // name of the target model
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
    tableName: 'user_designation',
    timestamps: false
  });

  UserDesignation.associate = (models) => {
    UserDesignation.belongsTo(models.Designation, {
      foreignKey: 'designation_id',
      as: 'designation'
    });
  };

  return UserDesignation;
};