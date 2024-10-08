const mysql = require( 'mysql' );
const util = require( 'util' );

const config = {
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    multipleStatements: true,
}

const configStaging = {
    host     : "nv-db.cw40jczte1ng.us-east-2.rds.amazonaws.com",
    user     : "devadmin",
    password : "99ventures#2020",
    database : "nv-db",
    multipleStatements: true,
}

function createDBConnection() {
    const connection = mysql.createConnection( config );
    return {
        query( sql, args ) {
            return util.promisify( connection.query )
            .call( connection, sql, args );
        },
        close() {
            return util.promisify( connection.end ).call( connection );
        },
        beginTransaction() {
            return util.promisify( connection.beginTransaction )
            .call( connection );
        },
        commit() {
            return util.promisify( connection.commit )
            .call( connection );
        },
        rollback() {
            return util.promisify( connection.rollback )
            .call( connection );
        }
    };
}

module.exports = createDBConnection