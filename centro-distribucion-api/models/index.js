/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const mysql2 = require('mysql2');

const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(`../config/config.js`)[env];
const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialectModule: mysql2, // Needed to fix sequelize issues with WebPack
  dialect: 'mysql',
};
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// module.exports = db;

module.exports = async () => {
  if (db.isConnected) {
    console.log('=> Using existing connection');
    return db;
  }
  try {
    // await sequelize.sync();
    await sequelize.authenticate();
    db.isConnected = true;
    console.log('=> Created a new connection');
    return db;
  } catch (e) {
    console.log(e);
    throw Error('DB Error connection', e);
  }
};
