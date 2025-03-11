'use strict';

module.exports = (sequelize, DataTypes) => {
    const ProfileOrganization = sequelize.define('ProfileOrganization', {
        profile_organization_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'template',
                key: 'template_id'
            }
        },
        table_row_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'organization_id'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'profile_organizations',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    // Define associations
    ProfileOrganization.associate = (models) => {
        ProfileOrganization.belongsTo(models.Template, {
            foreignKey: 'template_id'
        });
        ProfileOrganization.belongsTo(models.organizations, {
            foreignKey: 'organization_id'
        });
    };

    return ProfileOrganization;
};
