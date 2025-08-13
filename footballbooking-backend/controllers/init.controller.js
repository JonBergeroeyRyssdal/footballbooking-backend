// /controllers/init.controller.js
import pool from '../config/db.js'
import bcrypt from 'bcrypt'

// Helper: lag indeks hvis den ikke finnes (kompatibel med eldre MySQL)
async function ensureIndex(table, indexName, columns) {
  // columns: f.eks. "pitch_id, start_datetime"
  const [[{ db }]] = await pool.query('SELECT DATABASE() AS db')
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.statistics
     WHERE table_schema = ? AND table_name = ? AND index_name = ?`,
    [db, table, indexName]
  )
  if (rows.length === 0) {
    await pool.query(`CREATE INDEX ${indexName} ON ${table} (${columns})`)
  }
}

export const initializeDatabase = async (req, res) => {
  try {
    // --- Brukere / eiere / klubber / lokasjoner ---
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

    // --- Baner ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pitches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT,
        name VARCHAR(100) NOT NULL,
        size ENUM('5er', '7er', '11er') NOT NULL,
        location VARCHAR(100) NOT NULL,
        surface VARCHAR(100),
        hasLockerRoom BOOLEAN DEFAULT false,
        price INT DEFAULT 0,
        image LONGTEXT,
        FOREIGN KEY (owner_id) REFERENCES owners(id)
      );
    `)

    // --- Ukentlige (tilbakevendende) tider ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pitch_recurring_availability (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pitch_id INT NOT NULL,
        weekday TINYINT NOT NULL,                -- 0 = søn, 1 = man, ... 6 = lør
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        effective_from DATE NOT NULL,
        effective_to DATE NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pitch_id) REFERENCES pitches(id),
        CHECK (end_time > start_time)
      );
    `)

    // --- Enkeltøkter ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pitch_single_availability (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pitch_id INT NOT NULL,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pitch_id) REFERENCES pitches(id),
        CHECK (end_datetime > start_datetime)
      );
    `)

    // --- Svarteperioder ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pitch_blackouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pitch_id INT NOT NULL,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        reason VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pitch_id) REFERENCES pitches(id),
        CHECK (end_datetime > start_datetime)
      );
    `)

    // --- Bookinger ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pitch_id INT NOT NULL,
        user_id INT NOT NULL,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        status ENUM('pending','confirmed','cancelled') DEFAULT 'confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pitch_id) REFERENCES pitches(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        CHECK (end_datetime > start_datetime)
      );
    `)

    // --- Sikre riktige datatyper (hvis tabeller fantes fra før)
    await pool.query(`
      ALTER TABLE pitch_single_availability
        MODIFY start_datetime DATETIME NOT NULL,
        MODIFY end_datetime   DATETIME NOT NULL;
    `)

    await pool.query(`
      ALTER TABLE pitch_blackouts
        MODIFY start_datetime DATETIME NOT NULL,
        MODIFY end_datetime   DATETIME NOT NULL;
    `)

    await pool.query(`
      ALTER TABLE bookings
        MODIFY start_datetime DATETIME NOT NULL,
        MODIFY end_datetime   DATETIME NOT NULL;
    `)

    await pool.query(`
      ALTER TABLE pitch_recurring_availability
        MODIFY start_time TIME NOT NULL,
        MODIFY end_time   TIME NOT NULL;
    `)

    // --- Indekser (kompatibelt uten IF NOT EXISTS) ---
    await ensureIndex('pitch_single_availability', 'idx_psa_pitch_start', 'pitch_id, start_datetime')
    await ensureIndex('pitch_blackouts', 'idx_pbo_pitch_start', 'pitch_id, start_datetime')
    await ensureIndex('bookings', 'idx_bookings_pitch_start', 'pitch_id, start_datetime')
    await ensureIndex('pitch_recurring_availability', 'idx_pra_pitch_weekday', 'pitch_id, weekday')

    // --- Test-brukere ---
    const saltRounds = 10
    const adminHash = await bcrypt.hash('admin123', saltRounds)
    const userHash = await bcrypt.hash('user123', saltRounds)
    const ownerHash = await bcrypt.hash('owner123', saltRounds)

    await pool.query(`
      INSERT IGNORE INTO users (name, email, password, role, phone)
      VALUES (?, ?, ?, 'admin', ?)
    `, ['Admin Person', 'admin@example.com', adminHash, '99999999'])

    await pool.query(`
      INSERT IGNORE INTO users (name, email, password, role, phone)
      VALUES (?, ?, ?, 'user', ?)
    `, ['Test Bruker', 'user@example.com', userHash, '88888888'])

    await pool.query(`
      INSERT IGNORE INTO users (name, email, password, role, phone)
      VALUES (?, ?, ?, 'owner', ?)
    `, ['Bane Eier', 'owner@example.com', ownerHash, '77777777'])

    const [ownerUserRow] = await pool.query(
      `SELECT id FROM users WHERE email = ?`,
      ['owner@example.com']
    )
    const ownerUserId = ownerUserRow[0]?.id
    if (ownerUserId) {
      await pool.query(
        `INSERT IGNORE INTO owners (user_id, phone) VALUES (?, ?)`,
        [ownerUserId, '77777777']
      )
    }

    res.status(200).json({ message: 'Databasen er satt opp (indekser sjekket) og testbrukere opprettet.' })
  } catch (error) {
    console.error('Feil ved init:', error)
    res.status(500).json({ error: 'Noe gikk galt under oppretting/oppdatering av tabeller' })
  }
}





