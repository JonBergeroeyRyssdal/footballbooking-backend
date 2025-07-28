// controllers/user.controller.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Alle felter er påkrevd' });
    }

    // Sjekk om e-post allerede er brukt
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'E-post er allerede registrert' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')`,
      [name, email, hashedPassword]
    );

    const userId = userResult.insertId;

    await pool.query(
  `UPDATE users SET phone = ? WHERE id = ?`,
  [phone, userId]
);


    res.status(201).json({ message: 'Bruker registrert', userId });
  } catch (error) {
    console.error('Feil ved registrering:', error);
    res.status(500).json({ error: 'Noe gikk galt under registrering' });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Alle felter er påkrevd' });
  }

  try {
    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone, userId]
    );

    res.json({ message: 'Brukerinfo oppdatert' });
  } catch (error) {
    console.error('Feil ved oppdatering:', error);
    res.status(500).json({ error: 'Noe gikk galt ved oppdatering' });
  }
};


