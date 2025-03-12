'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserLog = sequelize.define('UserLog', {
        user_log_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,  // Null allowed for unauthenticated requests
            index: true,
        },
        api_name: {
            type: DataTypes.STRING,
            allowNull: false,
            index: true,
        },
        api_request: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: false,
            index: true,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        api_response: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'user_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,  // Ensures snake_case column naming
    });

    return UserLog;
};
