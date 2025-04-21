'use strict';

module.exports = (sequelize, DataTypes) => {
    const ProfileHistory = sequelize.define('ProfileHistory', {
        profile_history_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Template',
                key: 'template_id'
            },
        },
        table_row_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'user_id'
            },
        },
        field_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        updated_value: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        old_value: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'profile_history',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true, // Ensures snake_case column naming
    });

    // In ProfileHistory model
    ProfileHistory.associate = function (models) {
        ProfileHistory.belongsTo(models.Users, {
            foreignKey: 'user_id',
            as: 'userDetails'
        });
        ProfileHistory.belongsTo(models.Template, {
            foreignKey: 'template_id',
            as: 'templateDetails'
        });
    };



    return ProfileHistory;
};