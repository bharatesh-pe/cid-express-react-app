require('dotenv').config();
const { Sequelize } = require("sequelize");

// Create a configuration object
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: "postgres",
    schema: process.env.DB_SCHEMA || "public", // Default schema
};

// Initialize Sequelize
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
    }
);

// Export the configuration and the Sequelize instance
module.exports = {
    sequelize,
    dbConfig,
    development: dbConfig,
    test: dbConfig,
};
