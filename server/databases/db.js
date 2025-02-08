require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: "monorail.proxy.rlwy.net",
  port: 27764,
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "railway"
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL on Railway');
});

module.exports = connection;