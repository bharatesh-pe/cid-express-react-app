'use strict';

module.exports = (sequelize, DataTypes) => {
    const CaseHistory = sequelize.define('CaseHistory', {
        log_id: {
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
        actor_name: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        action: {
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
        tableName: 'case_history',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true, // Ensures snake_case column naming
    });

    // In CaseHistory model
    CaseHistory.associate = function (models) {
        CaseHistory.belongsTo(models.Users, {
            foreignKey: 'user_id',
            as: 'userDetails'
        });
        CaseHistory.belongsTo(models.Template, {
            foreignKey: 'template_id',
            as: 'templateDetails'
        });
    };



    return CaseHistory;
};