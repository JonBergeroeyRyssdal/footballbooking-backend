// /config/db.js
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Viktig: dateStrings=true gjør at DATETIME/DATE/TIME returneres som strenger,
// ikke som JS Date (som ellers kan autokonverteres i andre tidssoner).
const pool = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  dateStrings: true,  // ← unngå skjult TZ-konvertering
  timezone: 'local',  // påvirker mest TIMESTAMP; fint å være eksplisitt
  // optional:
  // multipleStatements: false,
})

export default pool


