'use strict';

module.exports = (sequelize, DataTypes) => {
    const UsersDepartment = sequelize.define('UsersDepartment', {
    user_department_id: {
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
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'department', // name of the target model
            key: 'department_id' // key in the target model that the foreign key refers to
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
    tableName: 'users_department',
    timestamps: false
    });

    UsersDepartment.associate = (models) => {
    UsersDepartment.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UsersDepartment.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department'
    });
  };

    return UsersDepartment;
}

