'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sso_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      tokenId: {
        type: Sequelize.STRING(32),
        allowNull: false,
        unique: true,
        comment: 'Unique token identifier for secure transmission'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      applicationCode: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Target application code'
      },
      encryptedToken: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Encrypted token data'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Token expiration timestamp'
      },
      isUsed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether token has been used'
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when token was used'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Whether token is active'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('sso_tokens', ['tokenId'], {
      name: 'idx_sso_tokens_token_id'
    });

    await queryInterface.addIndex('sso_tokens', ['userId'], {
      name: 'idx_sso_tokens_user_id'
    });

    await queryInterface.addIndex('sso_tokens', ['applicationCode'], {
      name: 'idx_sso_tokens_application_code'
    });

    await queryInterface.addIndex('sso_tokens', ['expiresAt'], {
      name: 'idx_sso_tokens_expires_at'
    });

    await queryInterface.addIndex('sso_tokens', ['isActive'], {
      name: 'idx_sso_tokens_is_active'
    });

    await queryInterface.addIndex('sso_tokens', ['isUsed'], {
      name: 'idx_sso_tokens_is_used'
    });

    // Composite index for cleanup queries
    await queryInterface.addIndex('sso_tokens', ['expiresAt', 'isActive'], {
      name: 'idx_sso_tokens_expires_active'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sso_tokens');
  }
};
