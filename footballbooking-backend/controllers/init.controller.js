// /controllers/init.controller.js
import pool from '../config/db.js';

export const initializeDatabase = async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('user', 'owner', 'tenant') DEFAULT 'user',
        phone VARCHAR(20)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS owners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        phone VARCHAR(20),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clubs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS owner_clubs (
        owner_id INT,
        club_id INT,
        PRIMARY KEY (owner_id, club_id),
        FOREIGN KEY (owner_id) REFERENCES owners(id),
        FOREIGN KEY (club_id) REFERENCES clubs(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        address VARCHAR(255),
        city VARCHAR(100)
      );
    `);

    res.status(200).json({ message: 'Database-tabeller opprettet!' });
  } catch (error) {
    console.error('Feil ved init:', error);
    res.status(500).json({ error: 'Noe gikk galt under oppretting av tabeller' });
  }
};

