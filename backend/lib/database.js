import mysql from 'mysql2/promise';
import 'dotenv/config';

// Create a connection to the database
const connection = await mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Function to create tables if they do not exist
const createTables = async () => {
    await connection.query(`
    CREATE TABLE IF NOT EXISTS monitor_status (
      id INT AUTO_INCREMENT PRIMARY KEY,
      monitor_name VARCHAR(255) NOT NULL,
      monitor_id INT NOT NULL,
      category VARCHAR(255) NOT NULL,
      status VARCHAR(10) NOT NULL,
      ping INT NOT NULL DEFAULT 0,
      last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (monitor_id)
    );
    `);
};

export { createTables, connection };