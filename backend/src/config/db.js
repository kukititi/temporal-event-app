const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,

  // Supabase (y Neon) exigen SSL para conexiones externas (ej: desde Render).
  // Sin esto, la conexión suele fallar al desplegar.
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;