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
        allowNull: true
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    return UsersDepartment;
}