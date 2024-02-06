'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// console.log('DB environment', {
//   DB_NAME: process.env.DB_NAME,
//   DB_USER: process.env.DB_USER,
//   DB_PASSWORD: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST || '127.0.0.1',
//   dialect: 'mysql',
//   port: process.env.DB_PORT || 3306,
// });

var sequelize = '';
if (process.env.DEV_MODE === '0') {
  sequelize = new Sequelize(process.env.DB_NAME, null, null, {
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
    operatorsAliases: {
      scripted_99_between: Sequelize.Op.between,
      scripted_99_like: Sequelize.Op.like,
      scripted_99_substring: Sequelize.Op.substring,
      scripted_99_or: Sequelize.Op.or,
      scripted_99_op_ne: Sequelize.Op.ne,
    },
    replication: {
      write: {
        host: 'nv-db-live.cluster-cw40jczte1ng.us-east-2.rds.amazonaws.com',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
      read: {
        host: 'nv-db-live.cluster-ro-cw40jczte1ng.us-east-2.rds.amazonaws.com',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || '127.0.0.1',
      dialect: 'mysql',
      port: process.env.DB_PORT || 3306,
      logging: false,
      operatorsAliases: {
        scripted_99_between: Sequelize.Op.between,
        scripted_99_like: Sequelize.Op.like,
        scripted_99_substring: Sequelize.Op.substring,
        scripted_99_or: Sequelize.Op.or,
        scripted_99_op_ne: Sequelize.Op.ne,
      },
    }
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
