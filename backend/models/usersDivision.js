'use strict';

module.exports = (sequelize, DataTypes) => {
    const UsersDivision = sequelize.define('UsersDivision', {
    user_division_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_department_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    division_id: {
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
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
    }, {
    tableName: 'users_division',
    timestamps: false
    });
    return UsersDivision;
}