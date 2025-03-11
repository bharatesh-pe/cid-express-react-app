'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TemplateUserStatus extends Model {
        static associate(models) {
            TemplateUserStatus.belongsTo(models.template, {
                foreignKey: 'template_id',
                targetKey: 'template_id',
                as: 'template'
            });

            TemplateUserStatus.belongsTo(models.Users, {  // Note: using 'user' not 'User' to match your model
                foreignKey: 'user_id',
                targetKey: 'user_id',
                as: 'userDetails'
            });
        }
    }

    TemplateUserStatus.init({
        template_user_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'template',
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
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'TemplateUserStatus',
        tableName: 'template_user_status',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    });

    return TemplateUserStatus;
};