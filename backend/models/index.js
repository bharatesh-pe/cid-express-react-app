'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dbConfig = require('../config/dbConfig');
const db = {};

const basename = path.basename(__filename);

// Initialize Sequelize instance for the single database
const sequelize = new Sequelize(
  dbConfig.database.database,
  dbConfig.database.username,
  dbConfig.database.password,
  {
    host: dbConfig.database.host,
    port: dbConfig.database.port,
    dialect: dbConfig.database.dialect,
    // schema: 'public',// Added schema
  }
);

// Load models from the current directory
fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Setup associations between models if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
console.log("Loaded models:", Object.keys(db));
// Export Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
