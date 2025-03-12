require('dotenv').config();

module.exports = {
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dialect: "postgres",
        schema: process.env.DB_SCHEMA || "public", // Default schema
    },
    development: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dialect: "postgres",
        schema: process.env.DB_SCHEMA || "public",
    },
    test: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dialect: "postgres",
        schema: process.env.DB_SCHEMA || "public",
    }
};
