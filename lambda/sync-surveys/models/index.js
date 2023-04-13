'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const db = {}
var sequelize = null;
if (!sequelize) {
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST || '127.0.0.1',
            dialect: 'mysql',
            port: process.env.DB_PORT || 3306,
            logging: false,
            pool: { max: 1, min: 0, idle: 1000, acquire: 60000, evict: 60000 }
        }

    );
} else {
    sequelize.connectionManager.initPools();
    // restore `getConnection()` if it has been overwritten by `close()`
    if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
        delete sequelize.connectionManager.getConnection;
    }
}

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
        )
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes
        )
        db[model.name] = model
    })

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
