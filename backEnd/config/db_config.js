const sql = require("mysql2/promise");
const dotenv = require("dotenv").config();

// Log environment variables to verify they're loaded correctly
console.log({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const pool = sql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  queueLimit: 0,
  port: process.env.DB_PORT,
});

// Function to check if the connection is established with the database
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to the database");
    connection.release();
  } catch (error) {
    console.log("Connection error: " + error);
    throw error;
  }
};

module.exports = { pool, checkConnection };
