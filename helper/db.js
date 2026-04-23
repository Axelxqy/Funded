// db.js
const{ Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config({ path: "keys.env" });

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: false
});

pool.on('connect', ()=>{
  console.log('Connected to PostgreSQL')
})

module.exports = pool;