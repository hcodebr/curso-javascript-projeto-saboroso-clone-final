const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'saboroso',
    multipleStatements: true
});

module.exports = connection;