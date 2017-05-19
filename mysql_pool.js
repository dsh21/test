var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'etc-dbs',
    user: '',
    password: '',
    database: 'master'
});

module.exports = pool;