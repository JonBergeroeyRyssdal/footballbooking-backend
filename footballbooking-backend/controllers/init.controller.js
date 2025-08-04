import pool from '../config/db.js'
import bcrypt from 'bcrypt'

export const initializeDatabase = async (req, res) => {
  try {
    // 📦 Opprett tabeller
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('user', 'owner', 'tenant', 'admin') DEFAULT 'user',
        phone VARCHAR(20)
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS owners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        phone VARCHAR(20),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clubs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS owner_clubs (
        owner_id INT,
        club_id INT,
        PRIMARY KEY (owner_id, club_id),
        FOREIGN KEY (owner_id) REFERENCES owners(id),
        FOREIGN KEY (club_id) REFERENCES clubs(id)
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        address VARCHAR(255),
        city VARCHAR(100)
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pitches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT,
        name VARCHAR(100) NOT NULL,
        size ENUM('5er', '7er', '11er') NOT NULL,
        location VARCHAR(100) NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES owners(id)
      );
    `)

    // 🔐 Lag passord-hash
    const saltRounds = 10
    const adminHash = await bcrypt.hash('admin123', saltRounds)
    const userHash = await bcrypt.hash('user123', saltRounds)
    const ownerHash = await bcrypt.hash('owner123', saltRounds)

    // 👤 Sett inn admin-bruker
    await pool.query(`
      INSERT IGNORE INTO users (name, email, password, role, phone)
      VALUES (?, ?, ?, 'admin', ?)
    `, ['Admin Person', 'admin@example.com', adminHash, '99999999'])

    // 👤 Sett inn vanlig bruker
    await pool.query(`
      INSERT IGNORE INTO users (name, email, password, role, phone)
      VALUES (?, ?, ?, 'user', ?)
    `, ['Test Bruker', 'user@example.com', userHash, '88888888'])

    // 👤 Sett inn eier-bruker
    const [ownerUserResult] = await pool.query(`
      INSERT IGNORE INTO users (name, email, password, role, phone)
      VALUES (?, ?, ?, 'owner', ?)
    `, ['Bane Eier', 'owner@example.com', ownerHash, '77777777'])

    // 📎 Finn ID (INSERT IGNORE kan returnere 0, så sjekk manuelt)
    const [ownerUserRow] = await pool.query(`
      SELECT id FROM users WHERE email = ?
    `, ['owner@example.com'])

    const ownerUserId = ownerUserRow[0]?.id

    if (ownerUserId) {
      await pool.query(`
        INSERT IGNORE INTO owners (user_id, phone)
        VALUES (?, ?)
      `, [ownerUserId, '77777777'])
    }

    res.status(200).json({ message: 'Databasen er satt opp og testbrukere opprettet.' })
  } catch (error) {
    console.error('Feil ved init:', error)
    res.status(500).json({ error: 'Noe gikk galt under oppretting av tabeller' })
  }
}

