'use strict';

module.exports = (sequelize, DataTypes) => {
    const ProfileAttachment = sequelize.define('ProfileAttachment', {
        profile_attachment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'templates',
                key: 'template_id'
            }
        },
        table_row_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        attachment_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        attachment_extension: {
            type: DataTypes.STRING,
            allowNull: false
        },
        attachment_size: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        s3_key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        field_name: {
            type: DataTypes.STRING,
            allowNull: false

        },
        folder_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'folder_categories',
                key: 'folder_id'
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
        tableName: 'profile_attachments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    // Define the association with templates table
    ProfileAttachment.associate = (models) => {
        ProfileAttachment.belongsTo(models.Template, {
            foreignKey: 'template_id',
            as: 'template'
        });
        ProfileAttachment.belongsTo(models.folder_categories, {
            foreignKey: 'folder_id',
            as: 'folderCategory'
        });

    };

    return ProfileAttachment;
};