module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fields', {
      field_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      field_name: {
        type: Sequelize.STRING,
        allowNull: false,
        index: true,
      },
      json: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('fields');
  },
};
