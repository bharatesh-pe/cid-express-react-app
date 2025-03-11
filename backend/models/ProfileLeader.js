'use strict';

module.exports = (sequelize, DataTypes) => {
    const ProfileLeader = sequelize.define('ProfileLeader', {
        profile_leader_id: {
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
        leader_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'leader',
                key: 'leader_id'
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
        tableName: 'profile_leaders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    // Define associations
    ProfileLeader.associate = (models) => {
        ProfileLeader.belongsTo(models.template, {
            foreignKey: 'template_id'
        });
        ProfileLeader.belongsTo(models.leader, {
            foreignKey: 'leader_id'
        });
    };

    return ProfileLeader;
};
