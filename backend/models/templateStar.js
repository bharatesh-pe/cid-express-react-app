'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TemplateStar extends Model {
        static associate(models) {
            // Fix associations to match exact model names
            TemplateStar.belongsTo(models.template, {
                foreignKey: 'template_id',
                targetKey: 'template_id',
                as: 'template'
            });

            TemplateStar.belongsTo(models.Users, {  // Note: using 'user' not 'User' to match your model
                foreignKey: 'user_id',
                targetKey: 'user_id',
                as: 'userDetails'
            });
        }
    }

    TemplateStar.init({
        template_star_id: {
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
                model: 'Users', // Note: using 'user' not 'users' to match your model
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
        modelName: 'TemplateStar',
        tableName: 'template_star',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    });

    return TemplateStar;
};