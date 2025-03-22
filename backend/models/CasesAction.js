const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
     const CasesAction = sequelize.define('CasesAction', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        table: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        module: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_pdf: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true
        },
        field: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'CasesAction',
        tableName: 'cases_action',
        timestamps: false, // Since we're only using created_at
        schema: process.env.DB_SCHEMA || 'public'
    });

    return CasesAction;
}; 